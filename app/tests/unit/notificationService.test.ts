/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import type { DomainEvent } from "../../server/domain/events";
import type { RecipientRuleRepositories } from "../../server/domain/recipientRules";
import {
  type EmailOutboxJob,
  type EmailOutboxRepository,
  type EmitEventDependencies,
  emitEvent,
  type NotificationRecord,
  type NotificationRepository,
} from "../../server/services/notificationService";

class InMemoryNotificationRepo implements NotificationRepository {
  notifications: NotificationRecord[] = [];

  async hasDedupeKey(userId: string, dedupeKey: string): Promise<boolean> {
    return this.notifications.some(
      (notification) =>
        notification.userId === userId && notification.dedupeKey === dedupeKey,
    );
  }

  async save(notification: NotificationRecord): Promise<void> {
    this.notifications.push(notification);
  }
}

class InMemoryEmailOutbox implements EmailOutboxRepository {
  jobs: EmailOutboxJob[] = [];

  async queueEmail(job: EmailOutboxJob): Promise<void> {
    this.jobs.push(job);
  }
}

class FakeRecipientRepos implements RecipientRuleRepositories {
  constructor(
    private data: {
      theaterStaffByShow?: Record<string, string[]>;
      producersByShow?: Record<string, string[]>;
      performers?: Record<string, true>;
      acceptedPerformersByOccurrence?: Record<string, string[]>;
    } = {},
  ) {}

  async getTheaterStaffForShow(showId: string) {
    return (this.data.theaterStaffByShow?.[showId] ?? []).map((userId) => ({
      userId,
    }));
  }

  async getShowProducers(showId: string) {
    return (this.data.producersByShow?.[showId] ?? []).map((userId) => ({
      userId,
    }));
  }

  async getPerformerById(userId: string) {
    return this.data.performers?.[userId] ? { userId } : null;
  }

  async getAcceptedPerformersForOccurrence(occurrenceId: string) {
    return (this.data.acceptedPerformersByOccurrence?.[occurrenceId] ?? []).map(
      (userId) => ({ userId }),
    );
  }
}

function buildDeps(
  overrides: Partial<EmitEventDependencies> = {},
): EmitEventDependencies {
  return {
    recipientRules: new FakeRecipientRepos(),
    notificationRepo: new InMemoryNotificationRepo(),
    emailOutbox: new InMemoryEmailOutbox(),
    ...overrides,
  };
}

describe("Notification Service", () => {
  it("notifies theater staff when a show is submitted for review", async () => {
    const deps = buildDeps({
      recipientRules: new FakeRecipientRepos({
        theaterStaffByShow: { "show-1": ["staff-1", "staff-2"] },
      }),
    });

    const event: DomainEvent = {
      type: "show.submitted_for_review",
      showId: "show-1",
      payload: { title: "Armando Night" },
    };

    const result = await emitEvent(event, deps);

    expect(result.delivered).toBe(2);
    expect(
      (deps.notificationRepo as InMemoryNotificationRepo).notifications.map(
        (n) => n.userId,
      ),
    ).toEqual(["staff-1", "staff-2"]);
    expect((deps.emailOutbox as InMemoryEmailOutbox).jobs.length).toBe(0);
  });

  it("routes occurrence reminders to producers and accepted performers", async () => {
    const deps = buildDeps({
      recipientRules: new FakeRecipientRepos({
        producersByShow: { "show-99": ["producer-1"] },
        acceptedPerformersByOccurrence: { "occ-99": ["performer-2"] },
      }),
    });

    const event: DomainEvent = {
      type: "occurrence.reminder_24h",
      showId: "show-99",
      occurrenceId: "occ-99",
      payload: { starts_at: "2026-02-01T20:00:00Z" },
    };

    const result = await emitEvent(event, deps);

    expect(result.delivered).toBe(2);
    const recipients = (
      deps.notificationRepo as InMemoryNotificationRepo
    ).notifications.map((n) => n.userId);
    expect(recipients).toContain("producer-1");
    expect(recipients).toContain("performer-2");
    expect(
      (deps.emailOutbox as InMemoryEmailOutbox).jobs.map((job) => job.userId),
    ).toEqual(expect.arrayContaining(["producer-1", "performer-2"]));
  });

  it("deduplicates notifications per user when the same event is retried", async () => {
    const notificationRepo = new InMemoryNotificationRepo();
    const deps = buildDeps({
      recipientRules: new FakeRecipientRepos({
        performers: { "performer-1": true },
      }),
      notificationRepo,
    });

    const event: DomainEvent = {
      type: "cast.invited",
      performerId: "performer-1",
      showId: "show-444",
    };

    const first = await emitEvent(event, deps);
    const second = await emitEvent(event, deps);

    expect(first.delivered).toBe(1);
    expect(second.deduped).toBe(1);
    expect(notificationRepo.notifications).toHaveLength(1);
  });
});
