import { defineQueryOptions, useQuery } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

const memberShowsQueryOptions = defineQueryOptions<void, { shows: any[] }>(
  () =>
    ({
      key: queryKeys.memberShows(),
      query: () => {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;
        return $fetch<{ shows: any[] }>("/api/shows", {
          credentials: "include",
          headers,
        });
      },
      staleTime: 20_000,
    }) as const,
);

export const useMemberShows = () => {
  const query = useQuery(memberShowsQueryOptions);
  return { ...query };
};
