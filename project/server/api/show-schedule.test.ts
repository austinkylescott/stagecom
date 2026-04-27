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

  in() {
    return this;
  }

  or() {
    return this;
  }

  order() {
    return this;
  }

  gte() {
    return this;
  }

  lt() {
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
  var parseQueryParams: (event: unknown, schema: unknown) => any;
  // eslint-disable-next-line no-var
  var getOptionalUserId: (event: unknown, supabase?: unknown) => Promise<string | null>;
}

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();

  globalThis.defineEventHandler = (handler) => handler;
  globalThis.createError = createErrorLike;
  globalThis.parseQueryParams = () => ({
    month: "2026-04",
    date: "2026-04-12",
    theater: "",
    type: undefined,
    status: undefined,
    timeline: "all",
  });
  globalThis.getOptionalUserId = vi.fn(async () => "viewer-1");
});

describe("show schedule route", () => {
  it("returns occurrence-aware items and filter metadata for visible shows", async () => {
    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-a",
              roles: ["member"],
              status: "active",
            },
          ],
        },
      ],
      theaters: [
        {
          data: [{ id: "theater-a", name: "Theater A", slug: "theater-a" }],
        },
      ],
    });

    const serviceSupabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-visible",
              title: "House Team Night",
              status: "approved",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
            {
              id: "show-hidden",
              title: "Private Rehearsal",
              status: "draft",
              theater_id: "theater-a",
              event_type: "practice",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
          ],
        },
      ],
      show_roles: [{ data: [] }],
      show_staff_assignments: [{ data: [] }],
      show_cast: [
        {
          data: [
            {
              show_id: "show-visible",
              source: "invited",
              status: "accepted",
            },
          ],
        },
      ],
      show_occurrences: [
        {
          data: [
            {
              id: "occ-1",
              show_id: "show-visible",
              starts_at: "2026-04-12T20:00:00.000Z",
              ends_at: "2026-04-12T21:30:00.000Z",
              status: "scheduled",
            },
          ],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/schedule.get")>(
      "./shows/schedule.get"
    );

    const response = await handler({} as never);

    expect(response.items).toEqual([
      {
        occurrenceId: "occ-1",
        startsAt: "2026-04-12T20:00:00.000Z",
        endsAt: "2026-04-12T21:30:00.000Z",
        occurrenceStatus: "scheduled",
        show: {
          id: "show-visible",
          title: "House Team Night",
          status: "approved",
          eventType: "show",
          theaterId: "theater-a",
          theaterName: "Theater A",
          theaterSlug: "theater-a",
        },
        viewerRelationships: ["cast", "theater_member"],
      },
    ]);

    expect(response.filters).toEqual({
      theaters: [{ label: "Theater A", value: "theater-a" }],
      eventTypes: [{ label: "Show", value: "show" }],
      statuses: [{ label: "Approved", value: "approved" }],
    });
  });

  it("applies theater, type, and status filters before loading occurrences", async () => {
    globalThis.parseQueryParams = () => ({
      month: "2026-04",
      date: "2026-04-12",
      theater: "theater-a",
      type: "show",
      status: "approved",
      timeline: "all",
    });

    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-a",
              roles: ["member"],
              status: "active",
            },
            {
              theater_id: "theater-b",
              roles: ["member"],
              status: "active",
            },
          ],
        },
      ],
      theaters: [
        {
          data: [
            { id: "theater-a", name: "Theater A", slug: "theater-a" },
            { id: "theater-b", name: "Theater B", slug: "theater-b" },
          ],
        },
      ],
    });

    const serviceSupabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-match",
              title: "Qualified Show",
              status: "approved",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
            {
              id: "show-status-miss",
              title: "Pending Show",
              status: "pending_review",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
            {
              id: "show-theater-miss",
              title: "Other Theater Show",
              status: "approved",
              theater_id: "theater-b",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
          ],
        },
      ],
      show_roles: [{ data: [] }],
      show_staff_assignments: [{ data: [] }],
      show_cast: [
        {
          data: [
            { show_id: "show-match", source: "invited", status: "accepted" },
            { show_id: "show-status-miss", source: "invited", status: "accepted" },
            { show_id: "show-theater-miss", source: "invited", status: "accepted" },
          ],
        },
      ],
      show_occurrences: [
        {
          data: [
            {
              id: "occ-match",
              show_id: "show-match",
              starts_at: "2026-04-15T20:00:00.000Z",
              ends_at: null,
              status: "scheduled",
            },
          ],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/schedule.get")>(
      "./shows/schedule.get"
    );

    const response = await handler({} as never);

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.show.id).toBe("show-match");
  });

  it("scopes occurrences to the requested month and timeline", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T12:00:00.000Z"));

    globalThis.parseQueryParams = () => ({
      month: "2026-04",
      theater: "",
      type: undefined,
      status: undefined,
      timeline: "upcoming",
    });

    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-a",
              roles: ["member"],
              status: "active",
            },
          ],
        },
      ],
      theaters: [
        {
          data: [{ id: "theater-a", name: "Theater A", slug: "theater-a" }],
        },
      ],
    });

    const serviceSupabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-visible",
              title: "House Team Night",
              status: "approved",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
          ],
        },
      ],
      show_roles: [{ data: [] }],
      show_staff_assignments: [{ data: [] }],
      show_cast: [
        {
          data: [
            {
              show_id: "show-visible",
              source: "invited",
              status: "accepted",
            },
          ],
        },
      ],
      show_occurrences: [
        {
          data: [
            {
              id: "occ-past",
              show_id: "show-visible",
              starts_at: "2026-04-10T20:00:00.000Z",
              ends_at: null,
              status: "scheduled",
            },
            {
              id: "occ-upcoming",
              show_id: "show-visible",
              starts_at: "2026-04-20T20:00:00.000Z",
              ends_at: null,
              status: "scheduled",
            },
            {
              id: "occ-next-month",
              show_id: "show-visible",
              starts_at: "2026-05-01T20:00:00.000Z",
              ends_at: null,
              status: "scheduled",
            },
          ],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/schedule.get")>(
      "./shows/schedule.get"
    );

    const response = await handler({} as never);

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.occurrenceId).toBe("occ-upcoming");

    vi.useRealTimers();
  });

  it("defaults to personal scope and returns empty without explicit show relationships", async () => {
    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-a",
              roles: ["member"],
              status: "active",
              is_home: true,
            },
          ],
        },
      ],
    });

    const serviceSupabase = createMockClient({
      show_roles: [{ data: [] }],
      show_staff_assignments: [{ data: [] }],
      show_cast: [{ data: [] }],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/schedule.get")>(
      "./shows/schedule.get"
    );

    const response = await handler({} as never);

    expect(response).toEqual({
      items: [],
      filters: {
        theaters: [],
        eventTypes: [],
        statuses: [],
      },
    });
  });

  it("includes show-staff-only private schedule items", async () => {
    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-a",
              roles: ["member"],
              status: "active",
            },
          ],
        },
      ],
      theaters: [
        {
          data: [{ id: "theater-a", name: "Theater A", slug: "theater-a" }],
        },
      ],
    });

    const serviceSupabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-staffed",
              title: "Private Tech Rehearsal",
              status: "draft",
              theater_id: "theater-a",
              event_type: "practice",
              casting_mode: "direct_invite",
              is_public_listed: false,
            },
          ],
        },
      ],
      show_roles: [{ data: [] }],
      show_staff_assignments: [{ data: [{ show_id: "show-staffed" }] }],
      show_cast: [{ data: [] }],
      show_occurrences: [
        {
          data: [
            {
              id: "occ-staffed",
              show_id: "show-staffed",
              starts_at: "2026-04-18T19:00:00.000Z",
              ends_at: null,
              status: "scheduled",
            },
          ],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/schedule.get")>(
      "./shows/schedule.get"
    );

    const response = await handler({} as never);

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.show.id).toBe("show-staffed");
    expect(response.items[0]?.viewerRelationships).toEqual([
      "show_staff",
      "theater_member",
    ]);
  });

  it("does not fail schedules when show staff assignments are missing from a stale schema cache", async () => {
    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-a",
              roles: ["member"],
              status: "active",
              is_home: true,
            },
          ],
        },
      ],
      theaters: [
        {
          data: [{ id: "theater-a", name: "Theater A", slug: "theater-a" }],
        },
      ],
    });

    const serviceSupabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-visible",
              title: "House Team Night",
              status: "approved",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
          ],
        },
      ],
      show_roles: [{ data: [] }],
      show_staff_assignments: [
        {
          error: {
            message:
              "Could not find the table 'public.show_staff_assignments' in the schema cache",
          },
        },
      ],
      show_cast: [
        {
          data: [
            {
              show_id: "show-visible",
              source: "invited",
              status: "accepted",
            },
          ],
        },
      ],
      show_occurrences: [
        {
          data: [
            {
              id: "occ-1",
              show_id: "show-visible",
              starts_at: "2026-04-12T20:00:00.000Z",
              ends_at: null,
              status: "scheduled",
            },
          ],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/schedule.get")>(
      "./shows/schedule.get"
    );

    const response = await handler({} as never);

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.viewerRelationships).toEqual([
      "cast",
      "theater_member",
      "home_theater",
    ]);
  });
});
