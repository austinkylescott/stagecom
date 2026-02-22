import { defineQueryOptions, useQuery, useQueryCache } from "@pinia/colada";
import type { Ref } from "vue";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

export type MemberShowsResponse = { shows: any[] };

const memberShowsQueryOptions = defineQueryOptions<void, MemberShowsResponse>(
  () =>
    ({
      key: queryKeys.memberShows(),
      query: () => {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;
        return $fetch<MemberShowsResponse>("/api/shows", {
          credentials: "include",
          headers,
        });
      },
      staleTime: 20_000,
    }) as const,
);

export const useMemberShows = (
  initialData?: Ref<MemberShowsResponse | null | undefined>,
) => {
  const queryCache = useQueryCache();
  if (import.meta.server && initialData?.value) {
    queryCache.setQueryData(queryKeys.memberShows(), initialData.value);
  }
  const query = useQuery(memberShowsQueryOptions);
  return { ...query };
};
