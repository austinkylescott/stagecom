import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = {
  data?: any;
  error?: { message: string; code?: string } | null;
  count?: number | null;
};

type QueryQueues = Record<string, QueryResult[]>;

const createErrorLike = ({
  statusCode,
  statusMessage,
  data,
}: {
  statusCode: number;
  statusMessage: string;
  data?: unknown;
}) => {
  const error = new Error(statusMessage) as Error & {
    statusCode: number;
    statusMessage: string;
    data?: unknown;
  };
  error.statusCode = statusCode;
  error.statusMessage = statusMessage;
  error.data = data;
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

  neq() {
    return this;
  }

  ilike() {
    return this;
  }

  in() {
    return this;
  }

  upsert() {
    return this;
  }

  update() {
    return this;
  }

  maybeSingle() {
    const result = this.nextResult();
    return Promise.resolve({
      ...result,
      data: Array.isArray(result.data) ? (result.data[0] ?? null) : (result.data ?? null),
    });
  }

  single() {
    const result = this.nextResult();
    return Promise.resolve({
      ...result,
      data: Array.isArray(result.data) ? (result.data[0] ?? null) : (result.data ?? null),
    });
  }

  then(
    onFulfilled?: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) {
    return Promise.resolve(this.nextResult()).then(onFulfilled, onRejected);
  }

  private nextResult(): QueryResult {
    const queue = this.queues[this.table];
    if (!queue?.length) {
      throw new Error(`No mock result queued for table ${this.table}`);
    }

    const next = queue.shift()!;
    return {
      count: next.count ?? null,
      data: next.data ?? null,
      error: next.error ?? null,
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
  var createError: typeof createErrorLike;
  // eslint-disable-next-line no-var
  var defineEventHandler: <T>(handler: T) => T;
  // eslint-disable-next-line no-var
  var parseBody: (event: unknown, schema: unknown) => Promise<any>;
  // eslint-disable-next-line no-var
  var requireUser: (event: unknown, supabase?: unknown) => Promise<any>;
  // eslint-disable-next-line no-var
  var requireUserId: (event: unknown, supabase?: unknown) => Promise<string>;
}

describe("me routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    globalThis.createError = createErrorLike;
    globalThis.defineEventHandler = (handler) => handler;
    globalThis.parseBody = vi.fn(async () => ({}));
    globalThis.requireUser = vi.fn(async () => ({
      email: "member@example.com",
      id: "user-1",
      user_metadata: {
        name: "Member Example",
      },
    }));
    globalThis.requireUserId = vi.fn(async () => "user-1");
  });

  it("accepts a blank displayName and falls back to the shared identity chain", async () => {
    const supabase = createMockClient({
      profiles: [
        {
          data: [
            {
              id: "user-1",
              display_name: "Existing Name",
              avatar_url: null,
              timezone: "America/New_York",
              handle: null,
              pronouns: null,
              bio: null,
              city: null,
              visibility: "theater_only",
              contact_links: {},
            },
          ],
        },
        {
          data: [
            {
              id: "user-1",
              display_name: "Member Example",
              avatar_url: null,
              timezone: "America/New_York",
              handle: null,
              pronouns: null,
              bio: null,
              city: null,
              visibility: "theater_only",
              contact_links: {},
            },
          ],
        },
      ],
    });

    globalThis.parseBody = vi.fn(async () => ({
      displayName: null,
      fieldVisibility: {
        displayName: "theater_only",
      },
    }));

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));

    const { default: handler } = await importFresh<
      typeof import("./me/profile.post")
    >("./me/profile.post");

    await expect(handler({} as never)).resolves.toMatchObject({
      display_name: "Member Example",
    });
  });

  it("returns and persists handle, phone, and contact visibility settings", async () => {
    const supabase = createMockClient({
      profiles: [
        {
          data: [
            {
              id: "user-1",
              display_name: "Member Example",
              avatar_url: null,
              timezone: "America/New_York",
              handle: "old-handle",
              pronouns: "they/them",
              bio: null,
              city: "Queens",
              visibility: "theater_only",
              field_visibility: {
                displayName: "theater_only",
                handle: "theater_only",
                pronouns: "theater_only",
                city: "theater_only",
                bio: "theater_only",
              },
              contact_links: {
                email: { source: "auth", visibility: "private" },
                phone: { value: null, visibility: "private" },
              },
            },
          ],
        },
        { data: [] },
        {
          data: [
            {
              id: "user-1",
              display_name: "Member Example",
              avatar_url: null,
              timezone: "America/New_York",
              handle: "member-example",
              pronouns: "they/them",
              bio: "Late night host",
              city: "Queens",
              visibility: "public",
              field_visibility: {
                displayName: "public",
                handle: "public",
                pronouns: "theater_only",
                city: "theater_only",
                bio: "private",
              },
              contact_links: {
                email: { source: "auth", visibility: "theater_only" },
                phone: { value: "555-1212", visibility: "public" },
              },
            },
          ],
        },
      ],
    });

    globalThis.parseBody = vi.fn(async () => ({
      displayName: "Member Example",
      handle: "member-example",
      pronouns: "they/them",
      city: "Queens",
      bio: "Late night host",
      visibility: "public",
      fieldVisibility: {
        displayName: "public",
        handle: "public",
        pronouns: "theater_only",
        city: "theater_only",
        bio: "private",
      },
      contactLinks: {
        email: {
          source: "auth",
          visibility: "theater_only",
        },
        phone: {
          value: "555-1212",
          visibility: "public",
        },
      },
    }));

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));

    const { default: handler } = await importFresh<
      typeof import("./me/profile.post")
    >("./me/profile.post");

    await expect(handler({} as never)).resolves.toMatchObject({
      handle: "member-example",
      fieldVisibility: {
        displayName: "public",
        handle: "public",
        pronouns: "theater_only",
        city: "theater_only",
        bio: "private",
      },
      visibility: "public",
      contactLinks: {
        email: { visibility: "theater_only" },
        phone: { value: "555-1212", visibility: "public" },
      },
      shareableContacts: {
        email: { value: "member@example.com", visibility: "theater_only" },
        phone: { value: "555-1212", visibility: "public" },
      },
    });
  });

  it("rejects mixed field visibility when field_visibility is missing", async () => {
    const supabase = createMockClient({
      profiles: [
        {
          error: {
            message: "column profiles.field_visibility does not exist",
          },
        },
        {
          data: [
            {
              id: "user-1",
              display_name: "Member Example",
              avatar_url: null,
              timezone: "America/New_York",
              handle: null,
              pronouns: null,
              bio: null,
              city: null,
              visibility: "theater_only",
              contact_links: {},
            },
          ],
        },
        { data: [] },
        {
          data: [
            {
              id: "user-1",
              display_name: "Member Example",
              avatar_url: null,
              timezone: "America/New_York",
              handle: "member-example",
              pronouns: null,
              bio: null,
              city: null,
              visibility: "public",
              contact_links: {
                email: { source: "auth", visibility: "private" },
                phone: { value: null, visibility: "private" },
              },
            },
          ],
        },
      ],
    });

    globalThis.parseBody = vi.fn(async () => ({
      displayName: "Member Example",
      handle: "member-example",
      visibility: "public",
      fieldVisibility: {
        displayName: "public",
        handle: "private",
        pronouns: "theater_only",
        city: "theater_only",
        bio: "private",
      },
    }));

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));

    const { default: handler } = await importFresh<
      typeof import("./me/profile.post")
    >("./me/profile.post");

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 409,
      data: {
        error: "validation_error",
        issues: [
          {
            path: "fieldVisibility",
          },
        ],
      },
    });
  });

  it("returns a friendly handle conflict error", async () => {
    const supabase = createMockClient({
      profiles: [
        {
          data: [
            {
              id: "user-1",
              display_name: "Member Example",
              avatar_url: null,
              timezone: "America/New_York",
              handle: null,
              pronouns: null,
              bio: null,
              city: null,
              visibility: "theater_only",
              contact_links: {},
            },
          ],
        },
        {
          data: [{ id: "user-2" }],
        },
      ],
    });

    globalThis.parseBody = vi.fn(async () => ({
      displayName: "Member Example",
      handle: "taken-name",
    }));

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));

    const { default: handler } = await importFresh<
      typeof import("./me/profile.post")
    >("./me/profile.post");

    await expect(handler({} as never)).rejects.toMatchObject({
      statusCode: 409,
      data: {
        error: "validation_error",
        issues: [
          {
            path: "handle",
          },
        ],
      },
    });
  });

  it("returns complete membership summaries for home and non-home memberships", async () => {
    const supabase = createMockClient({
      theater_memberships: [
        {
          data: [
            {
              theater_id: "theater-1",
              roles: ["staff"],
              status: "active",
              is_home: true,
              home_rank: 1,
            },
            {
              theater_id: "theater-2",
              roles: ["member"],
              status: "active",
              is_home: false,
              home_rank: null,
            },
          ],
        },
      ],
      theaters: [
        {
          data: [
            {
              id: "theater-1",
              name: "Magnet Annex",
              slug: "magnet-annex",
              tagline: "Long-form nights",
              timezone: "America/New_York",
              city: "New York",
              state_region: "NY",
              country: "USA",
            },
            {
              id: "theater-2",
              name: "Clubhouse",
              slug: "clubhouse",
              tagline: "Sketch and jams",
              timezone: "America/Los_Angeles",
              city: "Los Angeles",
              state_region: "CA",
              country: "USA",
            },
          ],
        },
      ],
    });

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));

    const { default: handler } = await importFresh<
      typeof import("./me/theater-hub.get")
    >("./me/theater-hub.get");

    await expect(handler({} as never)).resolves.toMatchObject({
      memberships: [
        {
          theater: { id: "theater-1", slug: "magnet-annex" },
          membership: {
            isHome: true,
            homeRank: 1,
            roles: ["staff"],
            status: "active",
          },
          permissions: {
            canCreateShow: true,
            canReview: true,
          },
        },
        {
          theater: { id: "theater-2", slug: "clubhouse" },
          membership: {
            isHome: false,
            homeRank: null,
            roles: ["member"],
            status: "active",
          },
          permissions: {
            canCreateShow: true,
            canReview: false,
          },
        },
      ],
    });
  });
});
