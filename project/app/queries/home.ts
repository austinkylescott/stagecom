import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

export type HomePayload = {
  theater: any | null;
  shows: any[];
  candidates?: any[];
};

export type SaveHomeInput = {
  theaterId: string | null;
};

type HomeQueryCache = {
  getQueryData: (key: readonly unknown[]) => unknown;
  setQueryData: (
    key: readonly unknown[],
    value: unknown | ((previous: unknown) => unknown),
  ) => unknown;
  invalidateQueries: (filters: {
    key: readonly unknown[];
    exact: boolean;
  }) => Promise<unknown> | unknown;
};

export const homeTheaterQueryOptions = defineQueryOptions<void, HomePayload>(
  () => {
    const headers = import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined;

    return {
      key: queryKeys.homeTheater(),
      query: async () => {
        try {
          return await $fetch<HomePayload>("/api/me/home-theater", {
            credentials: "include",
            headers,
          });
        } catch (err: any) {
          if (err?.status === 401 || err?.statusCode === 401) {
            return { theater: null, shows: [], candidates: [] };
          }
          throw err;
        }
      },
      staleTime: 15_000,
    } as const;
  },
);

export const saveHomeTheater = ({ theaterId }: SaveHomeInput) =>
  $fetch("/api/me/home-theater", {
    method: "POST",
    credentials: "include",
    body: { theaterId },
  });

export const applyOptimisticHomeTheaterUpdate = (
  queryCache: HomeQueryCache,
  theaterId: string | null,
) => {
  const previous = queryCache.getQueryData(queryKeys.homeTheater()) as
    | HomePayload
    | undefined;

  if (theaterId === null) {
    queryCache.setQueryData(queryKeys.homeTheater(), (value: unknown) => {
      if (!value) return value;
      const payload = value as HomePayload;
      return { ...payload, theater: null, shows: [] };
    });
  } else if (previous?.candidates) {
    const candidate = previous.candidates.find((c: any) => c.id === theaterId);
    if (candidate) {
      queryCache.setQueryData(queryKeys.homeTheater(), {
        ...previous,
        theater: candidate,
        shows: [],
      });
    }
  }

  return previous;
};

export const rollbackHomeTheaterUpdate = (
  queryCache: HomeQueryCache,
  previous?: HomePayload,
) => {
  if (!previous) return;
  queryCache.setQueryData(queryKeys.homeTheater(), previous);
};

export const invalidateHomeTheaterRelatedQueries = async (
  queryCache: HomeQueryCache,
) => {
  await Promise.all([
    queryCache.invalidateQueries({
      key: queryKeys.homeTheater(),
      exact: true,
    }),
    queryCache.invalidateQueries({
      key: queryKeys.theaters(),
      exact: false,
    }),
    queryCache.invalidateQueries({
      key: queryKeys.theaterPrefix(),
      exact: false,
    }),
  ]);
};
