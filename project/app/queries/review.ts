import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import type { Enums } from "~/types/database.types";
import { queryKeys } from "~/composables/queryKeys";

export type ReviewInboxShow = {
  id: string;
  title: string;
  description: string | null;
  status: Enums<"show_status">;
  eventType: Enums<"event_type"> | null;
  theaterId: string;
  theaterName: string;
  theaterSlug: string;
  nextStartsAt: string | null;
  createdByMe: boolean;
  canReview: boolean;
};

export type ReviewInboxResponse = {
  shows: ReviewInboxShow[];
};

export const reviewInboxQueryOptions = defineQueryOptions<void, ReviewInboxResponse>(
  () => {
    const headers = import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined;

    return {
      key: queryKeys.reviewInbox(),
      query: () =>
        $fetch<ReviewInboxResponse>("/api/review", {
          credentials: "include",
          headers,
        }),
      staleTime: 10_000,
    } as const;
  },
);
