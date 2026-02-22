import { defineQueryOptions, useQuery, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import { useRequestHeaders } from "#app";
import type { Tables } from "~/types/database.types";
import { queryKeys } from "~/composables/queryKeys";

// Keep this composable simple: inline $fetch with the few options we need.
type Theater = Pick<
  Tables<"theaters">,
  "id" | "name" | "slug" | "tagline" | "city" | "state_region" | "country"
> & { isMember?: boolean };

type QueryParams = {
  search: string;
  sort: "name_asc" | "recent" | "next_show";
  page: number;
  pageSize: number;
};

export type TheatersResponse = {
  theaters: Theater[];
  myTheaters: Theater[];
  totalPages?: number;
};

const theaterQueryOptions = defineQueryOptions<QueryParams, TheatersResponse>(
  (params) =>
    ({
      key: queryKeys.theaters(params),
      query: () => {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;
        return $fetch("/api/theaters", {
          credentials: "include",
          headers,
          params: {
            search: params?.search || undefined,
            sort: params?.sort || "name_asc",
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
          },
        });
      },
      staleTime: 30_000,
    }) as const,
);

export const useTheaterSearch = (
  params: {
    search: Ref<string>;
    sort: Ref<"name_asc" | "recent" | "next_show">;
    page: Ref<number>;
  },
  initialData?: Ref<TheatersResponse | null | undefined>,
) => {
  const { search, sort, page } = params;

  const queryParams = computed<QueryParams>(() => ({
    search: search.value.trim(),
    sort: sort.value,
    page: page.value,
    pageSize: 20,
  }));

  const queryCache = useQueryCache();
  if (import.meta.server && initialData?.value) {
    const key = queryKeys.theaters(queryParams.value);
    queryCache.setQueryData(key, initialData.value);
  }
  const query = useQuery(theaterQueryOptions, queryParams);
  const invalidate = async () => {
    await queryCache.invalidateQueries({
      key: queryKeys.theaters(),
      exact: false,
    });
  };

  return { ...query, invalidate };
};
