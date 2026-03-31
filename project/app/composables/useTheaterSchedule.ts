import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  theaterScheduleQueryOptions,
  type TheaterScheduleParams,
  type TheaterScheduleResponse,
} from "~/queries/theaters";

export type {
  TheaterScheduleItem,
  TheaterScheduleParams,
  TheaterScheduleResponse,
} from "~/queries/theaters";

export const useTheaterSchedule = (
  params: Ref<TheaterScheduleParams>,
  initialData?: Ref<TheaterScheduleResponse | null | undefined>,
) => {
  const queryOptions = computed(() => theaterScheduleQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => queryOptions.value.enabled ?? true,
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });

  return { ...query };
};
