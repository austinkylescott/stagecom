import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  applyOptimisticShowCastRequest,
  rollbackOptimisticShowDetail,
  showDetailQueryOptions,
  type CreateShowPayload,
  type ShowDetailResponse,
  type UpdateShowStatusAction,
} from "~/queries/shows";
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
      action:
        | "accept"
        | "approve"
        | "decline"
        | "withdraw"
        | "remove"
        | "set_program_order";
      targetUserId?: string;
      programOrder?: number | null;
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

export const useUpdateShowStatus = (
  showId: Ref<string>,
  theaterSlug?: Ref<string | null | undefined>,
) => {
  const queryCache = useQueryCache();

  return useMutation<
    void,
    {
      action: UpdateShowStatusAction;
      reason?: string;
      note?: string;
    }
  >({
    mutation: ({ action, reason, note }) =>
      $fetch(`/api/shows/${showId.value}/status`, {
        method: "POST",
        credentials: "include",
        body: { action, reason, note },
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: queryKeys.showDetail(showId.value),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.memberShowsSchedulePrefix(),
        exact: false,
      });
      queryCache.invalidateQueries({
        key: queryKeys.reviewInbox(),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.notifications(),
        exact: true,
      });

      if (theaterSlug?.value) {
        queryCache.invalidateQueries({
          key: queryKeys.theater(theaterSlug.value),
          exact: false,
        });
        queryCache.invalidateQueries({
          key: queryKeys.theaterReview(theaterSlug.value),
          exact: false,
        });
      }
    },
  });
};

export const useUpdateShowSettings = (showId: Ref<string>) => {
  const queryCache = useQueryCache();

  return useMutation<
    void,
    { isCastFinalized?: boolean; isPublicListed?: boolean }
  >({
    mutation: ({ isCastFinalized, isPublicListed }) =>
      $fetch(`/api/shows/${showId.value}/settings`, {
        method: "PATCH",
        credentials: "include",
        body: { isCastFinalized, isPublicListed },
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: queryKeys.showDetail(showId.value),
        exact: true,
      });
    },
  });
};

export const useUpdateShowDraft = (
  showId: Ref<string>,
  theaterSlug?: Ref<string | null | undefined>,
) => {
  const queryCache = useQueryCache();

  return useMutation<void, CreateShowPayload>({
    mutation: (body) =>
      $fetch(`/api/shows/${showId.value}/draft`, {
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
        key: queryKeys.memberShows(),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.memberShowsSchedulePrefix(),
        exact: false,
      });

      if (theaterSlug?.value) {
        queryCache.invalidateQueries({
          key: queryKeys.theater(theaterSlug.value),
          exact: false,
        });
        queryCache.invalidateQueries({
          key: queryKeys.theaterSchedulePrefix(),
          exact: false,
        });
      }
    },
  });
};

export const useRequestCast = (showId: Ref<string>) => {
  const queryCache = useQueryCache();
  const user = useSupabaseUser();

  return useMutation<
    { status: "pending"; source: "requested"; duplicate?: boolean },
    void,
    unknown,
    { previous?: ShowDetailResponse }
  >({
    mutation: async () => {
      try {
        return await $fetch<{ status: "pending"; source: "requested" }>(
          `/api/shows/${showId.value}/cast/request`,
          {
            method: "POST",
            credentials: "include",
          },
        );
      } catch (error: any) {
        const status =
          error?.statusCode ?? error?.status ?? error?.response?.status;
        const message =
          error?.data?.statusMessage ||
          error?.statusMessage ||
          error?.message ||
          "";

        if (
          status === 409 &&
          typeof message === "string" &&
          message.includes("active cast entry")
        ) {
          return {
            status: "pending",
            source: "requested",
            duplicate: true,
          };
        }

        throw error;
      }
    },
    onMutate: () => ({
      previous: applyOptimisticShowCastRequest(
        queryCache,
        showId.value,
        user.value?.id,
      ),
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
    onError: (_error, _vars, ctx) => {
      rollbackOptimisticShowDetail(queryCache, showId.value, ctx?.previous);
    },
  });
};
