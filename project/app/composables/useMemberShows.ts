import { useQuery, useQueryCache } from "@pinia/colada";
import type { Ref } from "vue";
import {
  memberShowsQueryOptions,
  type MemberShowsResponse,
} from "~/queries/shows";
import { queryKeys } from "~/composables/queryKeys";

export type { MemberShowsResponse } from "~/queries/shows";

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
