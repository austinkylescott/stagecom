import { useQuery } from "@pinia/colada";
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
  const queryOptions = computed(() => theaterDetailsQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => queryOptions.value.enabled ?? true,
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });
  return { ...query };
};
