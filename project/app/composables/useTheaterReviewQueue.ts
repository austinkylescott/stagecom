import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import { reviewQueueQueryOptions, type ReviewQueue } from "~/queries/theaters";

export type { ReviewQueue } from "~/queries/theaters";

export const useTheaterReviewQueue = (
  slug: Ref<string>,
  initialData?: Ref<ReviewQueue | null | undefined>,
) => {
  const params = computed(() => ({ slug: slug.value }));
  const queryOptions = computed(() => reviewQueueQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => queryOptions.value.enabled ?? true,
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });
  return { ...query };
};
