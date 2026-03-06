import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

export type MemberShowsResponse = { shows: any[] };
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
      key: queryKeys.theaterReview(slug || ""),
      exact: false,
    }),
    queryCache.invalidateQueries({
      key: queryKeys.theater(slug || ""),
      exact: false,
    }),
  ]);
};
