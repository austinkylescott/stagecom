import { defineQueryOptions, useQuery, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

export type ReviewQueue = {
  shows: {
    id: string;
    title: string;
    status: string;
    startsAt: string | null;
  }[];
};

type Params = { slug: string };

const reviewQueueQueryOptions = defineQueryOptions<Params, ReviewQueue>(
  (params) =>
    ({
      key: queryKeys.theaterReview(params?.slug || ""),
      query: () => {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;
        return $fetch<ReviewQueue>(`/api/theaters/${params?.slug}/review`, {
          credentials: "include",
          headers,
        });
      },
      enabled: Boolean(params?.slug),
      staleTime: 10_000,
    }) as const,
);

export const useTheaterReviewQueue = (
  slug: Ref<string>,
  initialData?: Ref<ReviewQueue | null | undefined>,
) => {
  const params = computed<Params>(() => ({ slug: slug.value }));
  const queryCache = useQueryCache();
  if (import.meta.server && initialData?.value) {
    queryCache.setQueryData(
      queryKeys.theaterReview(slug.value),
      initialData.value,
    );
  }
  const query = useQuery(reviewQueueQueryOptions, params);
  return { ...query };
};
