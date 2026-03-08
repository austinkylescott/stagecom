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
    sort: Ref<"name_asc" | "recent">;
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

  const queryOptions = computed(() => theatersQueryOptions(queryParams.value));
  const queryCache = useQueryCache();
  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });
  const invalidate = async () => {
    await queryCache.invalidateQueries({
      key: queryKeys.theaters(),
      exact: false,
    });
  };

  return { ...query, invalidate };
};
