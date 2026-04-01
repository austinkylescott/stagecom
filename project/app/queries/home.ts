import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import type { Tables } from "~/types/database.types";

export type HomeTheater = Pick<
  Tables<"theaters">,
  "id" | "name" | "slug" | "tagline" | "city" | "state_region" | "country"
>;

export type HomeShow = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string | null;
};

export type HomePayload = {
  theater: HomeTheater | null;
  shows: HomeShow[];
  candidates?: HomeTheater[];
  membership: {
    status: string | null;
    roles: string[];
  };
  permissions: {
    isMember: boolean;
    canCreateShow: boolean;
    canReview: boolean;
  };
  stats: {
    pendingReviewCount: number;
    publicShowCount: number;
    upcomingPublicCount: number;
  };
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
        } catch (err: unknown) {
          const httpError = err as { status?: number; statusCode?: number };
          if (httpError.status === 401 || httpError.statusCode === 401) {
            return {
              theater: null,
              shows: [],
              candidates: [],
              membership: { status: null, roles: [] },
              permissions: {
                isMember: false,
                canCreateShow: false,
                canReview: false,
              },
              stats: {
                pendingReviewCount: 0,
                publicShowCount: 0,
                upcomingPublicCount: 0,
              },
            };
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
      return {
        ...payload,
        theater: null,
        shows: [],
        membership: { status: null, roles: [] },
        permissions: {
          isMember: false,
          canCreateShow: false,
          canReview: false,
        },
        stats: {
          pendingReviewCount: 0,
          publicShowCount: 0,
          upcomingPublicCount: 0,
        },
      };
    });
  } else if (previous?.candidates) {
    const candidate = previous.candidates.find((c) => c.id === theaterId);
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

export const applyOptimisticHomeClearOnLeave = (
  queryCache: Pick<HomeQueryCache, "setQueryData">,
  theaterId?: string,
) => {
  if (!theaterId) return;

  queryCache.setQueryData(queryKeys.homeTheater(), (previous: unknown) => {
    if (!previous) return previous;
      const payload = previous as HomePayload;
      if (!payload.theater || payload.theater.id !== theaterId) return payload;
    return {
      ...payload,
      theater: null,
      shows: [],
      membership: { status: null, roles: [] },
      permissions: {
        isMember: false,
        canCreateShow: false,
        canReview: false,
      },
      stats: {
        pendingReviewCount: 0,
        publicShowCount: 0,
        upcomingPublicCount: 0,
      },
    };
  });
};
