import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import type { TheaterEventItem } from "~/queries/theaters";
import type { Tables } from "~/types/database.types";

export type HomeTheater = Pick<
  Tables<"theaters">,
  | "id"
  | "name"
  | "slug"
  | "tagline"
  | "city"
  | "state_region"
  | "country"
  | "timezone"
>;

export type HomeTheaterSummary = {
  theater: HomeTheater;
  membership: {
    status: string | null;
    roles: string[];
    isHome: boolean;
    homeRank?: number | null;
  };
  permissions: {
    canCreateShow: boolean;
    canReview: boolean;
  };
};

export type HomeTheaterDashboard = {
  upNextShow: TheaterEventItem | null;
  upNextOtherEvent: TheaterEventItem | null;
  nextThirtyDaysCount: number;
  pendingReviewCount: number;
};

export type HomePayload = {
  homeTheaters: HomeTheaterSummary[];
  candidateTheaters: HomeTheater[];
};

export type HomeTheaterDashboardResponse = {
  dashboard: HomeTheaterDashboard;
};

export type SaveHomeInput = {
  theaterId: string | null;
  isHome?: boolean;
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
          return await $fetch<HomePayload>("/api/me/theater-hub", {
            credentials: "include",
            headers,
          });
        } catch (err: unknown) {
          const httpError = err as { status?: number; statusCode?: number };
          if (httpError.status === 401 || httpError.statusCode === 401) {
            return {
              candidateTheaters: [],
              homeTheaters: [],
            };
          }
          throw err;
        }
      },
      staleTime: 15_000,
    } as const;
  },
);

export const homeTheaterDashboardQueryOptions = defineQueryOptions<
  { slug: string },
  HomeTheaterDashboardResponse
>((params) => {
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : undefined;

  return {
    key: queryKeys.homeTheaterDashboard(params?.slug || ""),
    query: () =>
      $fetch<HomeTheaterDashboardResponse>(
        `/api/me/theater-hub/${params?.slug}/dashboard`,
        {
          credentials: "include",
          headers,
        },
      ),
    enabled: Boolean(params?.slug),
    staleTime: 20_000,
  } as const;
});

export const saveHomeTheater = ({ theaterId, isHome }: SaveHomeInput) =>
  $fetch("/api/me/home-theater", {
    method: "POST",
    credentials: "include",
    body: { isHome, theaterId },
  });

export const applyOptimisticHomeTheaterUpdate = (
  _queryCache: HomeQueryCache,
  _theaterId: string | null,
  _isHome?: boolean,
) => undefined;

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
      key: queryKeys.homeTheaterDashboardPrefix(),
      exact: false,
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
    const removedHome = payload.homeTheaters.find(
      (entry) => entry.theater.id === theaterId,
    );

    return {
      ...payload,
      candidateTheaters: removedHome
        ? [...payload.candidateTheaters, removedHome.theater].sort((left, right) =>
            left.name.localeCompare(right.name),
          )
        : payload.candidateTheaters,
      homeTheaters: payload.homeTheaters.filter(
        (entry) => entry.theater.id !== theaterId,
      ),
    };
  });
};
