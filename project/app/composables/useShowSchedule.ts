import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  memberShowsScheduleQueryOptions,
  type ShowScheduleParams,
  type ShowScheduleResponse,
} from "~/queries/shows";

export type {
  ShowScheduleItem,
  ShowScheduleParams,
  ShowScheduleResponse,
} from "~/queries/shows";

export const useShowSchedule = (
  params: Ref<ShowScheduleParams>,
  initialData?: Ref<ShowScheduleResponse | null | undefined>,
) => {
  const queryOptions = computed(() =>
    memberShowsScheduleQueryOptions(params.value),
  );

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });

  return { ...query };
};
