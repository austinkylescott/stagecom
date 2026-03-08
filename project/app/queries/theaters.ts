import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import type { Tables } from "~/types/database.types";
import { queryKeys } from "~/composables/queryKeys";

// Shared types across theater-related queries so components/composables can reuse them
export type Theater = Pick<
  Tables<"theaters">,
  "id" | "name" | "slug" | "tagline" | "city" | "state_region" | "country"
> & { isMember?: boolean; isHome?: boolean };

export type TheaterQueryParams = {
  search: string;
  sort: "name_asc" | "recent";
  page: number;
  pageSize: number;
};

export type TheatersResponse = {
  theaters: Theater[];
  myTheaters: Theater[];
  totalPages?: number;
};

const getRequestHeaders = () =>
  import.meta.server ? useRequestHeaders(["cookie"]) : undefined;

export const theatersQueryOptions = defineQueryOptions<
  TheaterQueryParams,
  TheatersResponse
>((params) => {
  const headers = getRequestHeaders();

  return {
    key: queryKeys.theaters(params),
    query: () =>
      $fetch<TheatersResponse>("/api/theaters", {
        credentials: "include",
        headers,
        params: {
          search: params?.search || undefined,
          sort: params?.sort || "name_asc",
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
        },
      }),
    staleTime: 30_000,
  } as const;
});

export type TheaterDetails = {
  theater: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    street: string | null;
    city: string | null;
    state_region: string | null;
    postal_code: string | null;
    country: string | null;
  };
  membership: {
    status: string | null;
    roles: string[];
    isHome: boolean;
  };
  permissions: {
    canReview: boolean;
  };
  stats: {
    memberCount: number;
    totalShows: number;
    pendingReviewCount: number;
    publicShowCount: number;
  };
  shows: {
    public: {
      id: string;
      title: string;
      description: string | null;
      eventType?: string | null;
      startsAt: string | null;
    }[];
  };
};

export const theaterDetailsQueryOptions = defineQueryOptions<
  { slug: string },
  TheaterDetails
>((params) => {
  const headers = getRequestHeaders();

  return {
    key: queryKeys.theater(params?.slug || ""),
    query: () =>
      $fetch<TheaterDetails>(`/api/theaters/${params?.slug}`, {
        headers,
        credentials: "include",
      }),
    enabled: Boolean(params?.slug),
    staleTime: 20_000,
  } as const;
});

export type ReviewQueue = {
  shows: {
    id: string;
    title: string;
    status: string;
    startsAt: string | null;
  }[];
};

export const reviewQueueQueryOptions = defineQueryOptions<
  { slug: string },
  ReviewQueue
>((params) => {
  const headers = getRequestHeaders();

  return {
    key: queryKeys.theaterReview(params?.slug || ""),
    query: () =>
      $fetch<ReviewQueue>(`/api/theaters/${params?.slug}/review`, {
        credentials: "include",
        headers,
      }),
    enabled: Boolean(params?.slug),
    staleTime: 10_000,
  } as const;
});

type MembershipAction = "join" | "leave";

type TheaterMembershipTarget = {
  id?: string;
  slug: string;
};

type TheatersQueryCache = {
  setQueriesData: (
    filters: { key: readonly unknown[]; exact: boolean },
    updater: (previous: unknown) => unknown,
  ) => unknown;
  setQueryData: (
    key: readonly unknown[],
    updater: unknown | ((previous: unknown) => unknown),
  ) => unknown;
};

export const applyOptimisticMembershipToTheaterLists = (
  queryCache: Pick<TheatersQueryCache, "setQueriesData">,
  theater: TheaterMembershipTarget,
  action: MembershipAction,
) => {
  if (!theater.id) return;

  queryCache.setQueriesData(
    { key: queryKeys.theaters(), exact: false },
    (previous: unknown) => {
      if (!previous) return previous;
      const payload = previous as TheatersResponse;

      const update = (t: Theater) =>
        t.id === theater.id ? { ...t, isMember: action === "join" } : t;

      const theaters = Array.isArray(payload.theaters)
        ? payload.theaters.map(update)
        : payload.theaters;

      let myTheaters = Array.isArray(payload.myTheaters)
        ? [...payload.myTheaters]
        : payload.myTheaters;

      if (Array.isArray(myTheaters)) {
        if (action === "join") {
          const exists = myTheaters.some((t) => t.id === theater.id);
          if (!exists && Array.isArray(payload.theaters)) {
            const full = payload.theaters.find((t) => t.id === theater.id);
            if (full) myTheaters = [update(full), ...myTheaters];
          }
        } else {
          myTheaters = myTheaters.filter((t) => t.id !== theater.id);
        }
      }

      return { ...payload, theaters, myTheaters };
    },
  );
};

export const applyOptimisticMembershipToTheaterDetail = (
  queryCache: Pick<TheatersQueryCache, "setQueryData">,
  theater: TheaterMembershipTarget,
  action: MembershipAction,
) => {
  queryCache.setQueryData(
    queryKeys.theater(theater.slug),
    (previous: unknown) => {
      if (!previous) return previous;
      const payload = previous as TheaterDetails;
      return {
        ...payload,
        membership: {
          ...payload.membership,
          status: action === "join" ? "active" : null,
          isHome: action === "leave" ? false : payload.membership?.isHome,
        },
      };
    },
  );
};
