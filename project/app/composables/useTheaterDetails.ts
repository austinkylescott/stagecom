import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  theaterDetailsQueryOptions,
  theaterMetaQueryOptions,
  type TheaterDetails,
  type TheaterMeta,
  theaterUpcomingQueryOptions,
  type TheaterUpcomingResponse,
} from "~/queries/theaters";

export type {
  TheaterDetails,
  TheaterMeta,
  TheaterUpcomingResponse,
} from "~/queries/theaters";

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

export const useTheaterMeta = (
  slug: Ref<string>,
  initialData?: Ref<TheaterMeta | null | undefined>,
) => {
  const params = computed(() => ({ slug: slug.value }));
  const queryOptions = computed(() => theaterMetaQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => queryOptions.value.enabled ?? true,
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });
  return { ...query };
};

export const useTheaterUpcoming = (slug: Ref<string>) => {
  const params = computed(() => ({ slug: slug.value }));
  const queryOptions = computed(() => theaterUpcomingQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => import.meta.client && (queryOptions.value.enabled ?? true),
    staleTime: () => queryOptions.value.staleTime,
  });
  return { ...query };
};
