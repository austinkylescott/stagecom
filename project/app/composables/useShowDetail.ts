import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import { showDetailQueryOptions, type ShowDetailResponse } from "~/queries/shows";
import { queryKeys } from "~/composables/queryKeys";

export type { ShowDetailResponse } from "~/queries/shows";

export const useShowDetail = (
  id: Ref<string>,
  initialData?: Ref<ShowDetailResponse | null | undefined>,
) => {
  const params = computed(() => ({ id: id.value }));
  const queryOptions = computed(() => showDetailQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => queryOptions.value.enabled ?? true,
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });

  return { ...query };
};

export const useInviteCast = (showId: Ref<string>) => {
  const queryCache = useQueryCache();

  return useMutation<void, { userId: string }>({
    mutation: ({ userId }) =>
      $fetch(`/api/shows/${showId.value}/cast`, {
        method: "POST",
        credentials: "include",
        body: { userId },
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: queryKeys.showDetail(showId.value),
        exact: true,
      });
    },
  });
};

export const usePatchCast = (showId: Ref<string>) => {
  const queryCache = useQueryCache();

  return useMutation<
    void,
    {
      action: "accept" | "approve" | "decline" | "withdraw" | "remove";
      targetUserId?: string;
    }
  >({
    mutation: (body) =>
      $fetch(`/api/shows/${showId.value}/cast`, {
        method: "PATCH",
        credentials: "include",
        body,
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: queryKeys.showDetail(showId.value),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.notifications(),
        exact: true,
      });
    },
  });
};

export const useRequestCast = (showId: Ref<string>) => {
  const queryCache = useQueryCache();

  return useMutation<void, void>({
    mutation: () =>
      $fetch(`/api/shows/${showId.value}/cast/request`, {
        method: "POST",
        credentials: "include",
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: queryKeys.showDetail(showId.value),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.notifications(),
        exact: true,
      });
    },
  });
};
