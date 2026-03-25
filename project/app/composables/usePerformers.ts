import { useQuery } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  performersQueryOptions,
  type PerformersQueryParams,
  type PerformersResponse,
} from "~/queries/people";

export type { PerformersResponse } from "~/queries/people";

export const usePerformers = (params: {
  search: Ref<string>;
  page: Ref<number>;
  pageSize?: number;
  theaterId?: Ref<string | undefined>;
}) => {
  const { search, page } = params;
  const pageSize = params.pageSize ?? 24;

  const queryParams = computed<PerformersQueryParams>(() => ({
    search: search.value.trim(),
    page: page.value,
    pageSize,
    theaterId: params.theaterId?.value,
  }));

  const query = useQuery(performersQueryOptions, queryParams);
  return { ...query };
};
