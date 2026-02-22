import { useMutation, useQueryCache } from "@pinia/colada";
import { useToast } from "#imports";
import { queryKeys } from "~/composables/queryKeys";

type ToggleAction = "join" | "leave";

export const useMembershipToggle = () => {
  const toast = useToast?.();
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
      if (!theater.id) return;

      queryCache.setQueriesData(
        { key: queryKeys.theaters(), exact: false },
        (previous: any) => {
          if (!previous) return previous;

          const update = (t: any) =>
            t.id === theater.id ? { ...t, isMember: action === "join" } : t;

          const theaters = Array.isArray(previous.theaters)
            ? previous.theaters.map(update)
            : previous.theaters;

          let myTheaters = Array.isArray(previous.myTheaters)
            ? [...previous.myTheaters]
            : previous.myTheaters;

          if (Array.isArray(myTheaters)) {
            if (action === "join") {
              const exists = myTheaters.some((t) => t.id === theater.id);
              if (!exists && Array.isArray(previous.theaters)) {
                const full = previous.theaters.find(
                  (t: any) => t.id === theater.id,
                );
                if (full) myTheaters = [update(full), ...myTheaters];
              }
            } else {
              myTheaters = myTheaters.filter((t) => t.id !== theater.id);
            }
          }

          return { ...previous, theaters, myTheaters };
        },
      );

      queryCache.setQueryData(
        queryKeys.theater(theater.slug),
        (previous: any) => {
          if (!previous) return previous;
          return {
            ...previous,
            membership: {
              ...previous.membership,
              status: action === "join" ? "active" : null,
              isHome: action === "leave" ? false : previous.membership?.isHome,
            },
          };
        },
      );

      if (action === "leave") {
        queryCache.setQueryData(queryKeys.homeTheater(), (previous: any) => {
          if (!previous?.theater) return previous;
          if (previous.theater.id !== theater.id) return previous;
          return { ...previous, theater: null, shows: [] };
        });
      }
    },
    onSuccess: async (_data, vars) => {
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
