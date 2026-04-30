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

  gte() {
    return this;
  }

  is() {
    return this;
  }

  ilike() {
    return this;
  }

  or() {
    return this;
  }

  order() {
    return this;
  }

  range() {
    return Promise.resolve(this.nextResult());
  }

  limit() {
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
  var parseQueryParams: (event: unknown, schema: unknown) => any;
  // eslint-disable-next-line no-var
  var getOptionalUserId: (event: unknown, supabase?: unknown) => Promise<string | null>;
}

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();

  globalThis.defineEventHandler = (handler) => handler;
  globalThis.createError = createErrorLike;
  globalThis.parseParams = () => ({ id: "show-1", slug: "theater-slug" });
  globalThis.parseQueryParams = () => ({
    search: "",
    page: 1,
    pageSize: 24,
    theaterId: "theater-a",
  });
  globalThis.getOptionalUserId = vi.fn(async () => "viewer-1");
});

describe("visibility route wiring", () => {
  it("returns 403 for unauthorized access to a non-public show", async () => {
    const supabase = createMockClient({});
    const serviceSupabase = createMockClient({
      shows: [
        {
          data: [
            {
              id: "show-1",
              title: "Secret Show",
              description: null,
              status: "draft",
              event_type: "show",
              casting_mode: "theater_casting",
              cast_min: null,
              cast_max: null,
              is_cast_finalized: false,
              is_public_listed: false,
              ticket_url: null,
              on_sale_at: null,
              theater_id: "theater-a",
              created_by_user_id: "creator-1",
            },
          ],
        },
      ],
      show_roles: [{ data: [] }],
      theater_memberships: [{ data: [] }],
      show_cast: [{ data: [] }],
      show_staff_assignments: [{ data: [] }],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/[id]/index.get")>(
      "./shows/[id]/index.get"
    );

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: "Not allowed",
    });
  });

  it("filters unrelated non-public shows from the member show list", async () => {
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
              id: "show-public",
              title: "Public Show",
              description: null,
              status: "approved",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "public_casting",
              is_public_listed: true,
            },
            {
              id: "show-private",
              title: "Private Show",
              description: null,
              status: "draft",
              theater_id: "theater-a",
              event_type: "show",
              casting_mode: "theater_casting",
              is_public_listed: false,
            },
            {
              id: "show-cast",
              title: "Cast Show",
              description: null,
              status: "draft",
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
              show_id: "show-cast",
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
              show_id: "show-public",
              starts_at: "2026-04-01T20:00:00.000Z",
              status: "scheduled",
            },
            {
              show_id: "show-cast",
              starts_at: "2026-04-02T20:00:00.000Z",
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

    const { default: handler } = await importFresh<typeof import("./shows/index.get")>(
      "./shows/index.get"
    );

    const result = await handler({} as never);

    expect(result.shows.map((show: { id: string }) => show.id)).toEqual([
      "show-public",
      "show-cast",
    ]);
  });

  it("does not leak performer affiliations for an unshared theater filter", async () => {
    const supabase = createMockClient({
      profiles: [
        {
          data: [
            {
              id: "performer-1",
              display_name: "Performer One",
              avatar_url: null,
              handle: "performer-one",
              visibility: "public",
              field_visibility: {
                displayName: "private",
                handle: "public",
                pronouns: "private",
                city: "private",
                bio: "private",
              },
            },
          ],
          count: 1,
        },
      ],
    });

    const serviceSupabase = createMockClient({
      theater_memberships: [
        {
          data: [{ user_id: "performer-1" }],
        },
        {
          data: [],
        },
        {
          data: [{ user_id: "performer-1", theater_id: "theater-a", status: "active" }],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/service-role", () => ({
      getServiceRoleClient: vi.fn(() => serviceSupabase),
    }));

    const { default: handler } = await importFresh<typeof import("./performers.get")>(
      "./performers.get"
    );

    const result = await handler({} as never);

    expect(result.profiles).toMatchObject([
      {
        id: "performer-1",
        display_name: "@performer-one",
        handle: "performer-one",
      },
    ]);
    expect(result.memberships).toEqual([]);
  });
});
