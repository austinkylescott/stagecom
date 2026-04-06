import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import type { Enums } from "~/types/database.types";
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
  boardSettings: {
    upcomingOtherEventsLimit: number;
    upcomingShowsLimit: number;
  };
  dashboard: {
    upNextOtherEvent: TheaterEventItem | null;
    upNextShow: TheaterEventItem | null;
  };
  membership: {
    status: string | null;
    roles: string[];
    isHome: boolean;
  };
  permissions: {
    canCreateShow: boolean;
    canReview: boolean;
  };
  programming: {
    nextThirtyDays: TheaterEventItem[];
    upcomingShows: TheaterEventItem[];
  };
  stats: {
    memberCount: number;
    totalShows: number;
    pendingReviewCount: number;
    publicShowCount: number;
    upcomingPublicOccurrenceCount: number;
    visibleNextThirtyDaysCount: number;
  };
  theater: {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    timezone: string;
    street: string;
    city: string;
    state_region: string;
    postal_code: string;
    country: string;
    website_url: string | null;
    logo_url: string | null;
  };
};

export type TheaterMeta = Pick<
  TheaterDetails,
  "boardSettings" | "membership" | "permissions" | "theater"
>;

export type TheaterUpcomingResponse = {
  otherEvents: TheaterEventItem[];
  shows: TheaterEventItem[];
};

export type TheaterEventPerson = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type TheaterEventItem = {
  occurrenceId: string;
  startsAt: string;
  endsAt: string | null;
  occurrenceStatus: Enums<"show_occurrence_status">;
  show: {
    id: string;
    title: string;
    description: string | null;
    status: Enums<"show_status">;
    eventType: Enums<"event_type"> | null;
    ticketUrl: string | null;
    theaterId: string;
    theaterName: string;
    theaterSlug: string;
  };
  producers: TheaterEventPerson[];
  cast: TheaterEventPerson[];
};

export type TheaterScheduleParams = {
  slug: string;
  month: string;
  type: string;
  status: string;
  timeline: "all" | "upcoming" | "past";
};

export type TheaterScheduleItem = {
  occurrenceId: string;
  startsAt: string;
  endsAt: string | null;
  occurrenceStatus: Enums<"show_occurrence_status">;
  show: {
    id: string;
    title: string;
    status: Enums<"show_status">;
    eventType: Enums<"event_type"> | null;
    theaterId: string;
    theaterName: string;
    theaterSlug: string;
  };
};

export type TheaterScheduleResponse = {
  theater: {
    id: string;
    name: string;
    slug: string;
  };
  items: TheaterScheduleItem[];
  filters: {
    eventTypes: { label: string; value: Enums<"event_type"> }[];
    statuses: { label: string; value: Enums<"show_status"> }[];
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

export const theaterMetaQueryOptions = defineQueryOptions<
  { slug: string },
  TheaterMeta
>((params) => {
  const headers = getRequestHeaders();

  return {
    key: queryKeys.theaterMeta(params?.slug || ""),
    query: () =>
      $fetch<TheaterMeta>(`/api/theaters/${params?.slug}/meta`, {
        headers,
        credentials: "include",
      }),
    enabled: Boolean(params?.slug),
    staleTime: 20_000,
  } as const;
});

export const theaterUpcomingQueryOptions = defineQueryOptions<
  { slug: string },
  TheaterUpcomingResponse
>((params) => {
  const headers = getRequestHeaders();

  return {
    key: queryKeys.theaterUpcoming(params?.slug || ""),
    query: () =>
      $fetch<TheaterUpcomingResponse>(`/api/theaters/${params?.slug}/upcoming`, {
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

export const theaterScheduleQueryOptions = defineQueryOptions<
  TheaterScheduleParams,
  TheaterScheduleResponse
>((params) => {
  const headers = getRequestHeaders();

  return {
    key: queryKeys.theaterSchedule({
      slug: params?.slug ?? "",
      month: params?.month ?? "",
      type: params?.type ?? "",
      status: params?.status ?? "",
      timeline: params?.timeline ?? "all",
    }),
    query: () =>
      $fetch<TheaterScheduleResponse>(`/api/theaters/${params?.slug}/schedule`, {
        credentials: "include",
        headers,
        params: {
          month: params?.month || undefined,
          type: params?.type || undefined,
          status: params?.status || undefined,
          timeline: params?.timeline ?? "all",
        },
      }),
    enabled: Boolean(params?.slug),
    staleTime: 20_000,
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
  const applyMembershipUpdate = <
    T extends TheaterDetails | TheaterMeta
  >(
    previous: unknown,
  ) => {
    if (!previous) return previous;
    const payload = previous as T;
    return {
      ...payload,
      membership: {
        ...payload.membership,
        status: action === "join" ? "active" : null,
        isHome: action === "leave" ? false : payload.membership?.isHome,
      },
    };
  };

  queryCache.setQueryData(queryKeys.theater(theater.slug), applyMembershipUpdate);
  queryCache.setQueryData(queryKeys.theaterMeta(theater.slug), applyMembershipUpdate);
};
