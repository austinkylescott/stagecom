import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = {
  data?: any;
  error?: { message: string } | null;
  count?: number | null;
};

type QueryQueues = Record<string, QueryResult[]>;

const createErrorLike = ({
  statusCode,
  statusMessage,
}: {
  statusCode: number;
  statusMessage: string;
}) => {
  const error = new Error(statusMessage) as Error & {
    statusCode: number;
    statusMessage: string;
  };
  error.statusCode = statusCode;
  error.statusMessage = statusMessage;
  return error;
};

class MockQueryBuilder {
  constructor(
    private readonly table: string,
    private readonly queues: QueryQueues,
  ) {}

  select() {
    return this;
  }

  eq() {
    return this;
  }

  update() {
    return this;
  }

  insert() {
    return this;
  }

  maybeSingle() {
    const result = this.nextResult();
    return Promise.resolve({
      ...result,
      data: Array.isArray(result.data) ? (result.data[0] ?? null) : (result.data ?? null),
    });
  }

  then(onFulfilled?: (value: QueryResult) => unknown, onRejected?: (reason: unknown) => unknown) {
    return Promise.resolve(this.nextResult()).then(onFulfilled, onRejected);
  }

  private nextResult(): QueryResult {
    const queue = this.queues[this.table];
    if (!queue?.length) {
      throw new Error(`No mock result queued for table ${this.table}`);
    }

    const next = queue.shift()!;
    return {
      data: next.data ?? null,
      error: next.error ?? null,
      count: next.count ?? null,
    };
  }
}

const createMockClient = (queues: QueryQueues) => ({
  from: (table: string) => new MockQueryBuilder(table, queues),
});

const importFresh = async <T>(path: string): Promise<T> => {
  vi.resetModules();
  return import(path) as Promise<T>;
};

declare global {
  // eslint-disable-next-line no-var
  var defineEventHandler: <T>(handler: T) => T;
  // eslint-disable-next-line no-var
  var createError: typeof createErrorLike;
  // eslint-disable-next-line no-var
  var parseParams: (event: unknown, schema: unknown) => any;
  // eslint-disable-next-line no-var
  var parseBody: (event: unknown, schema: unknown) => Promise<any>;
  // eslint-disable-next-line no-var
  var requireUserId: (event: unknown, supabase?: unknown) => Promise<string>;
}

describe("show status route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    globalThis.defineEventHandler = (handler) => handler;
    globalThis.createError = createErrorLike;
    globalThis.parseParams = () => ({ id: "show-1" });
    globalThis.parseBody = vi.fn(async () => ({ action: "approve" }));
    globalThis.requireUserId = vi.fn(async () => "viewer-1");
  });

  it("moves changes_requested items back to draft", async () => {
    const supabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-1",
              title: "House Team Night",
              theater_id: "theater-1",
              status: "pending_review",
              theaters: { slug: "theater-1" },
            },
          ],
        },
        { data: [] },
      ],
      theater_memberships: [{ data: [{ roles: ["staff"], status: "active" }] }],
      show_roles: [{ data: [] }],
    });
    const serviceSupabase = createMockClient({
      show_review_events: [{ data: [] }],
    });

    globalThis.parseBody = vi.fn(async () => ({
      action: "changes_requested",
      reason: "schedule_unclear",
      note: "Please confirm timing",
    }));

    const emitEvent = vi.fn();
    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));
    vi.doMock("~~/server/utils/notify", () => ({
      emitEvent,
      buildShowEvent: vi.fn((type, base) => ({ type, ...base })),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/[id]/status.post")>(
      "./shows/[id]/status.post"
    );

    await expect(handler({} as never)).resolves.toMatchObject({
      status: "draft",
      action: "changes_requested",
      reviewLogged: true,
    });
    expect(emitEvent).not.toHaveBeenCalled();
  });

  it("allows producers to submit a draft for review and notifies staff", async () => {
    const supabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-1",
              title: "House Team Night",
              summary: "A late show with two teams.",
              description: "A full hour of house team improv.",
              theater_id: "theater-1",
              status: "draft",
              theaters: { slug: "theater-1" },
            },
          ],
        },
        { data: [] },
      ],
      show_occurrences: [
        {
          data: [
            {
              id: "occ-1",
              starts_at: "2026-04-10T00:00:00.000Z",
              ends_at: "2026-04-10T01:00:00.000Z",
            },
          ],
        },
      ],
      theater_memberships: [
        { data: [] },
        {
          data: [
            { user_id: "staff-1", roles: ["staff"], status: "active" },
            { user_id: "member-1", roles: ["member"], status: "active" },
          ],
        },
      ],
      show_roles: [{ data: [{ role: "producer" }] }],
    });
    const serviceSupabase = createMockClient({
      show_review_events: [{ data: [] }],
    });

    globalThis.parseBody = vi.fn(async () => ({
      action: "submit_for_review",
    }));

    const emitEvent = vi.fn();
    const buildShowEvent = vi.fn((type, base) => ({ type, ...base }));
    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));
    vi.doMock("~~/server/utils/notify", () => ({
      emitEvent,
      buildShowEvent,
    }));

    const { default: handler } = await importFresh<typeof import("./shows/[id]/status.post")>(
      "./shows/[id]/status.post"
    );

    await expect(handler({} as never)).resolves.toMatchObject({
      status: "pending_review",
      action: "submit_for_review",
      reviewLogged: true,
    });
    expect(buildShowEvent).toHaveBeenCalledWith(
      "show.submitted_for_review",
      expect.objectContaining({
        showId: "show-1",
        recipientId: "staff-1",
      }),
    );
    expect(emitEvent).toHaveBeenCalledTimes(1);
  });

  it("notifies producers when staff approve a show", async () => {
    const supabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-1",
              title: "House Team Night",
              theater_id: "theater-1",
              status: "pending_review",
              theaters: { slug: "theater-1" },
            },
          ],
        },
        { data: [] },
      ],
      theater_memberships: [{ data: [{ roles: ["manager"], status: "active" }] }],
      show_roles: [
        { data: [] },
        { data: [{ user_id: "producer-1" }, { user_id: "producer-2" }] },
      ],
    });
    const serviceSupabase = createMockClient({
      show_review_events: [{ data: [] }],
    });

    globalThis.parseBody = vi.fn(async () => ({
      action: "approve",
    }));

    const emitEvent = vi.fn();
    const buildShowEvent = vi.fn((type, base) => ({ type, ...base }));
    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));
    vi.doMock("~~/server/utils/notify", () => ({
      emitEvent,
      buildShowEvent,
    }));

    const { default: handler } = await importFresh<typeof import("./shows/[id]/status.post")>(
      "./shows/[id]/status.post"
    );

    await expect(handler({} as never)).resolves.toMatchObject({
      status: "approved",
      action: "approve",
      reviewLogged: true,
    });
    expect(buildShowEvent).toHaveBeenCalledWith(
      "show.approved",
      expect.objectContaining({
        showId: "show-1",
        recipientId: "producer-1",
      }),
    );
    expect(buildShowEvent).toHaveBeenCalledWith(
      "show.approved",
      expect.objectContaining({
        showId: "show-1",
        recipientId: "producer-2",
      }),
    );
    expect(emitEvent).toHaveBeenCalledTimes(2);
  });
});
