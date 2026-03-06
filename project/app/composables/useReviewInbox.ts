import { useQuery, useQueryCache } from "@pinia/colada";
import type { Ref } from "vue";
import {
  reviewInboxQueryOptions,
  type ReviewInboxResponse,
} from "~/queries/review";
import { queryKeys } from "~/composables/queryKeys";

export type { ReviewInboxResponse, ReviewInboxShow } from "~/queries/review";

export const useReviewInbox = (
  initialData?: Ref<ReviewInboxResponse | null | undefined>,
) => {
  const queryCache = useQueryCache();

  if (import.meta.server && initialData?.value) {
    queryCache.setQueryData(queryKeys.reviewInbox(), initialData.value);
  }

  const query = useQuery(reviewInboxQueryOptions);
  return { ...query };
};
