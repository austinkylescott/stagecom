import { useQuery, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  reviewQueueQueryOptions,
  type ReviewQueue,
} from "~/queries/theaters";

export type { ReviewQueue } from "~/queries/theaters";

export const useTheaterReviewQueue = (
  slug: Ref<string>,
  initialData?: Ref<ReviewQueue | null | undefined>,
) => {
  const params = computed(() => ({ slug: slug.value }));
  const queryCache = useQueryCache();
  if (import.meta.server && initialData?.value) {
    queryCache.setQueryData(
      reviewQueueQueryOptions(params.value).key,
      initialData.value,
    );
  }
  const query = useQuery(reviewQueueQueryOptions, params);
  return { ...query };
};
