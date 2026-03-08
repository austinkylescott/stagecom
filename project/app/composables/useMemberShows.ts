import { useQuery } from "@pinia/colada";
import type { Ref } from "vue";
import {
  memberShowsQueryOptions,
  type MemberShowsResponse,
  type ShowItem,
} from "~/queries/shows";

export type { MemberShowsResponse, ShowItem } from "~/queries/shows";

export const useMemberShows = (
  initialData?: Ref<MemberShowsResponse | null | undefined>,
) => {
  const query = useQuery({
    ...memberShowsQueryOptions(),
    initialData: () => initialData?.value ?? undefined,
  });
  return { ...query };
};
