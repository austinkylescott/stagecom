import { useMutation, useQueryCache } from "@pinia/colada";
import { useToast } from "#imports";
import { queryKeys } from "~/composables/queryKeys";
import { applyOptimisticHomeClearOnLeave } from "~/queries/home";
import {
  applyOptimisticMembershipToTheaterDetail,
  applyOptimisticMembershipToTheaterLists,
} from "~/queries/theaters";

type ToggleAction = "join" | "leave";

type UseMembershipToggleOptions = {
  onSuccess?: (action: ToggleAction) => void;
  onError?: (error: unknown) => void;
};

export const useMembershipToggle = (
  options: UseMembershipToggleOptions = {},
) => {
  const toast = useToast();
  const queryCache = useQueryCache();

  const mutation = useMutation<
    { status: string },
    { theater: { slug: string; id?: string }; action: ToggleAction }
  >({
    mutation: ({ theater, action }) =>
      $fetch<{ status: string }>(`/api/theaters/${theater.slug}/membership`, {
        method: "POST",
        credentials: "include",
        body: { action },
      }),
    onMutate: ({ theater, action }) => {
      applyOptimisticMembershipToTheaterLists(queryCache, theater, action);
      applyOptimisticMembershipToTheaterDetail(queryCache, theater, action);

      if (action === "leave") {
        applyOptimisticHomeClearOnLeave(queryCache, theater.id);
      }
    },
    onSuccess: async (_data, vars) => {
      options.onSuccess?.(vars.action);
      toast?.add({
        title: vars.action === "join" ? "Followed" : "Unfollowed",
        color: vars.action === "join" ? "primary" : "error",
      });
      await Promise.all([
        queryCache.invalidateQueries({
          key: queryKeys.theaters(),
          exact: false,
        }),
        queryCache.invalidateQueries({
          key: queryKeys.homeTheater(),
          exact: true,
        }),
        queryCache.invalidateQueries({
          key: queryKeys.memberShows(),
          exact: true,
        }),
        queryCache.invalidateQueries({
          key: queryKeys.theaterPrefix(),
          exact: false,
        }),
      ]);
    },
    onError: (e: any) => {
      options.onError?.(e);
      queryCache.invalidateQueries({ key: queryKeys.theaters(), exact: false });
      queryCache.invalidateQueries({
        key: queryKeys.theaterPrefix(),
        exact: false,
      });
      queryCache.invalidateQueries({
        key: queryKeys.homeTheater(),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      });
      toast?.add({
        title: "Action failed",
        description:
          e?.data?.statusMessage ||
          e?.data?.message ||
          e?.message ||
          "Unknown error",
        color: "error",
      });
    },
  });

  const toggleMembership = async (
    theater: { slug: string; name?: string; id?: string },
    action: ToggleAction,
  ) => mutation.mutateAsync({ theater, action });

  return { toggleMembership };
};
