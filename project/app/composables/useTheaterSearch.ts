import { useQuery, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  theatersQueryOptions,
  type TheaterQueryParams,
  type TheatersResponse,
} from "~/queries/theaters";
import { queryKeys } from "~/composables/queryKeys";

export const useTheaterSearch = (
  params: {
    search: Ref<string>;
    sort: Ref<"name_asc" | "recent" | "next_show">;
    page: Ref<number>;
  },
  initialData?: Ref<TheatersResponse | null | undefined>,
) => {
  const { search, sort, page } = params;

  const queryParams = computed<TheaterQueryParams>(() => ({
    search: search.value.trim(),
    sort: sort.value,
    page: page.value,
    pageSize: 20,
  }));

  const queryCache = useQueryCache();
  if (import.meta.server && initialData?.value) {
    const key = theatersQueryOptions(queryParams.value).key;
    queryCache.setQueryData(key, initialData.value);
  }
  const query = useQuery(theatersQueryOptions, queryParams);
  const invalidate = async () => {
    await queryCache.invalidateQueries({
      key: queryKeys.theaters(),
      exact: false,
    });
  };

  return { ...query, invalidate };
};
