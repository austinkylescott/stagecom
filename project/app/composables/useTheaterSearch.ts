import { useRequestHeaders, useNuxtData } from "#app";
import type { Tables } from "~/types/database.types";

type Theater = Pick<
  Tables<"theaters">,
  "id" | "name" | "slug" | "tagline" | "city" | "state_region" | "country"
> & { isMember?: boolean };

export const useTheaterSearch = (params: {
  search: Ref<string>;
  sort: Ref<"name_asc" | "recent" | "next_show">;
  page: Ref<number>;
}) => {
  const { search, sort, page } = params;
  const key = () =>
    `theater-search:${search.value}:${sort.value}:${page.value}`;

  const query = () => {
    const headers = import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined;
    return $fetch<{
      theaters: Theater[];
      myTheaters: Theater[];
      totalPages?: number;
    }>("/api/theaters", {
      credentials: "include",
      headers,
      params: {
        search: search.value || undefined,
        sort: sort.value,
        page: page.value,
        pageSize: 20,
      },
    });
  };

  const asyncData = useAsyncData(key, query, {
    getCachedData: (k) => useNuxtData(k)?.data?.value,
    server: true,
    immediate: true,
  });

  return asyncData;
};
