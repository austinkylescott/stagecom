import { computed } from "vue";
import { useMutation, useQueryCache } from "@pinia/colada";
import { queryKeys } from "~/composables/queryKeys";
import { useHomeTheater } from "~/composables/useHomeTheater";
import { useHomeTheaterStore } from "~/stores/homeTheater";

export const useHomeTheaterState = () => {
  const { data, refresh } = useHomeTheater();
  const store = useHomeTheaterStore();
  const queryCache = useQueryCache();

  const homeTheater = computed(
    () => data.value?.theater || store.theater || null,
  );
  const homeShows = computed(() => data.value?.shows || store.shows || []);
  const homeCandidates = computed(
    () => data.value?.candidates || store.candidates || [],
  );
  const homeId = computed(
    () => homeTheater.value?.id || store.theater?.id || null,
  );
  const hasHome = computed(() => Boolean(homeId.value || store.theater?.id));

  const mutation = useMutation<
    void,
    { theaterId: string | null },
    any,
    { previous: any }
  >({
    mutation: ({ theaterId }) =>
      $fetch("/api/me/home-theater", {
        method: "POST",
        credentials: "include",
        body: { theaterId },
      }),
    onMutate: ({ theaterId }) => {
      const previous = queryCache.getQueryData(queryKeys.homeTheater());

      if (theaterId === null) {
        queryCache.setQueryData(queryKeys.homeTheater(), (value: any) => {
          if (!value) return value;
          return { ...value, theater: null, shows: [] };
        });
      } else if (previous?.candidates) {
        const candidate = previous.candidates.find(
          (c: any) => c.id === theaterId,
        );
        if (candidate) {
          queryCache.setQueryData(queryKeys.homeTheater(), {
            ...previous,
            theater: candidate,
            shows: [],
          });
        }
      }

      return { previous };
    },
    onSuccess: async () => {
      await Promise.all([
        queryCache.invalidateQueries({
          key: queryKeys.homeTheater(),
          exact: true,
        }),
        queryCache.invalidateQueries({
          key: queryKeys.theaters(),
          exact: false,
        }),
        queryCache.invalidateQueries({
          key: queryKeys.theaterPrefix(),
          exact: false,
        }),
      ]);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryCache.setQueryData(queryKeys.homeTheater(), ctx.previous);
      }
    },
  });

  const saveHome = async (theaterId: string | null) => {
    await mutation.mutateAsync({ theaterId });
  };

  return {
    data,
    refreshHome: refresh,
    saveHome,
    homeTheater,
    homeShows,
    homeCandidates,
    homeId,
    hasHome,
  };
};
