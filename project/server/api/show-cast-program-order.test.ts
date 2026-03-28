import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryResult = {
  data?: any;
  error?: { message: string } | null;
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
  private pendingUpdate: Record<string, unknown> | null = null;
  private eqFilters: Record<string, unknown> = {};

  constructor(
    private readonly table: string,
    private readonly queues: QueryQueues,
    private readonly updates: Array<{
      table: string;
      values: Record<string, unknown>;
      filters: Record<string, unknown>;
    }>,
  ) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.eqFilters[column] = value;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.pendingUpdate = values;
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
    if (this.pendingUpdate) {
      this.updates.push({
        table: this.table,
        values: this.pendingUpdate,
        filters: { ...this.eqFilters },
      });
    }

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
    };
  }
}

const createMockClient = (queues: QueryQueues, updates: Array<{
  table: string;
  values: Record<string, unknown>;
  filters: Record<string, unknown>;
}>) => ({
  from: (table: string) => new MockQueryBuilder(table, queues, updates),
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

describe("show cast program ordering", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    globalThis.defineEventHandler = (handler) => handler;
    globalThis.createError = createErrorLike;
    globalThis.parseParams = () => ({ id: "show-1" });
    globalThis.parseBody = vi.fn(async () => ({
      action: "set_program_order",
      targetUserId: "performer-c",
      programOrder: 2,
    }));
    globalThis.requireUserId = vi.fn(async () => "producer-1");
  });

  it("reindexes accepted performers to avoid program_order collisions", async () => {
    const updates: Array<{
      table: string;
      values: Record<string, unknown>;
      filters: Record<string, unknown>;
    }> = [];

    const supabase = createMockClient(
      {
        show_roles: [{ data: [{ role: "producer" }] }],
        show_cast: [
          { data: [{ status: "accepted" }] },
          {
            data: [
              { user_id: "performer-a", program_order: 1 },
              { user_id: "performer-b", program_order: 2 },
              { user_id: "performer-c", program_order: null },
            ],
          },
          { data: [] },
          { data: [] },
        ],
      },
      updates,
    );

    vi.doMock("#supabase/server", () => ({
      serverSupabaseClient: vi.fn(async () => supabase),
    }));
    vi.doMock("~~/server/utils/notify", () => ({
      emitEvent: vi.fn(),
      buildCastEvent: vi.fn(),
    }));

    const { default: handler } = await importFresh<typeof import("./shows/[id]/cast.patch")>(
      "./shows/[id]/cast.patch"
    );

    await expect(handler({} as never)).resolves.toMatchObject({
      status: "accepted",
      programOrder: 2,
    });

    expect(updates).toEqual([
      {
        table: "show_cast",
        values: { program_order: 3 },
        filters: { show_id: "show-1", user_id: "performer-b" },
      },
      {
        table: "show_cast",
        values: { program_order: 2 },
        filters: { show_id: "show-1", user_id: "performer-c" },
      },
    ]);
  });
});
