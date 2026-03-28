import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import type { Enums } from "~/types/database.types";

export type ShowItem = {
  id: string;
  title: string;
  description: string | null;
  status: Enums<"show_status">;
  eventType: Enums<"event_type"> | null;
  theaterId: string;
  theaterName: string;
  theaterSlug: string;
  nextStartsAt: string | null;
};

export type MemberShowsResponse = { shows: ShowItem[] };

export type CreateShowPayload = {
  title: string;
  description: string;
  eventType: string;
  castingMode: string;
  startsAt?: string;
  endsAt?: string;
  castMin?: number | null;
  castMax?: number | null;
  ticketUrl?: string;
};

export type CreateShowInput = {
  submitForReview: boolean;
  payload: CreateShowPayload;
};

export type ShowDetailResponse = {
  show: {
    id: string;
    title: string;
    description: string | null;
    status: Enums<"show_status">;
    eventType: Enums<"event_type">;
    castingMode: Enums<"casting_mode">;
    castMin: number | null;
    castMax: number | null;
    isCastFinalized: boolean;
    isPublicListed: boolean;
    ticketUrl: string | null;
    onSaleAt: string | null;
    theaterId: string;
    theaterName: string | null;
    theaterSlug: string | null;
  };
  occurrences: {
    id: string;
    starts_at: string;
    ends_at: string | null;
    status: Enums<"show_occurrence_status">;
  }[];
  producers: {
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
  }[];
  cast: {
    userId: string;
    source: Enums<"show_cast_source">;
    status: Enums<"show_cast_status">;
    programOrder: number | null;
    note: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  }[];
  viewerCast: {
    userId: string;
    source: Enums<"show_cast_source">;
    status: Enums<"show_cast_status">;
    programOrder: number | null;
    note: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  permissions: {
    isProducer: boolean;
    canRequestToJoin: boolean;
    canSeePendingCast: boolean;
  };
};

export type UpdateShowStatusAction =
  | "submit_for_review"
  | "approve"
  | "reject"
  | "changes_requested"
  | "cancel"
  | "reopen_draft";

type ShowDetailQueryCache = {
  getQueryData: (key: readonly unknown[]) => unknown;
  setQueryData: (
    key: readonly unknown[],
    value: unknown | ((previous: unknown) => unknown),
  ) => unknown;
};

export const memberShowsQueryOptions = defineQueryOptions<
  void,
  MemberShowsResponse
>(() => {
  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  return {
    key: queryKeys.memberShows(),
    query: () =>
      $fetch<MemberShowsResponse>("/api/shows", {
        credentials: "include",
        headers,
      }),
    staleTime: 20_000,
  } as const;
});

export const showDetailQueryOptions = defineQueryOptions<
  { id: string },
  ShowDetailResponse
>((params) => {
  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  return {
    key: queryKeys.showDetail(params?.id ?? ""),
    query: () =>
      $fetch<ShowDetailResponse>(`/api/shows/${params?.id}`, {
        credentials: "include",
        headers,
      }),
    enabled: Boolean(params?.id),
    staleTime: 20_000,
  } as const;
});

export const invalidateShowRelatedQueries = async (
  queryCache: {
    invalidateQueries: (filters: {
      key: readonly unknown[];
      exact: boolean;
    }) => Promise<unknown> | unknown;
  },
  slug: string,
) => {
  await Promise.all([
    queryCache.invalidateQueries({
      key: queryKeys.memberShows(),
      exact: true,
    }),
    queryCache.invalidateQueries({
      key: queryKeys.theaterReview(slug ?? ""),
      exact: false,
    }),
    queryCache.invalidateQueries({
      key: queryKeys.theater(slug ?? ""),
      exact: false,
    }),
  ]);
};

export const applyOptimisticShowCastRequest = (
  queryCache: ShowDetailQueryCache,
  showId: string,
  userId?: string | null,
) => {
  const key = queryKeys.showDetail(showId);
  const previous = queryCache.getQueryData(key) as ShowDetailResponse | undefined;

  if (!userId || !previous) {
    return previous;
  }

  const existingCastIndex = previous.cast.findIndex((member) => member.userId === userId);
  const nextCast =
    existingCastIndex >= 0
      ? previous.cast.map((member, index) =>
          index === existingCastIndex
            ? {
                ...member,
                source: "requested" as const,
                status: "pending" as const,
              }
            : member,
        )
      : [
          ...previous.cast,
          {
            userId,
            source: "requested" as const,
            status: "pending" as const,
            programOrder: null,
            note: null,
            displayName: null,
            avatarUrl: null,
          },
        ];

  queryCache.setQueryData(key, {
    ...previous,
    cast: nextCast,
  });

  return previous;
};

export const rollbackOptimisticShowDetail = (
  queryCache: Pick<ShowDetailQueryCache, "setQueryData">,
  showId: string,
  previous?: ShowDetailResponse,
) => {
  if (!previous) return;
  queryCache.setQueryData(queryKeys.showDetail(showId), previous);
};
