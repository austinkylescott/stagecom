import { useQuery, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  theaterDetailsQueryOptions,
  type TheaterDetails,
} from "~/queries/theaters";

export type { TheaterDetails } from "~/queries/theaters";

export const useTheaterDetails = (
  slug: Ref<string>,
  initialData?: Ref<TheaterDetails | null | undefined>,
) => {
  const params = computed(() => ({ slug: slug.value }));
  const queryCache = useQueryCache();
  if (import.meta.server && initialData?.value) {
    queryCache.setQueryData(
      theaterDetailsQueryOptions(params.value).key,
      initialData.value,
    );
  }
  const query = useQuery(theaterDetailsQueryOptions, params);
  return { ...query };
};
