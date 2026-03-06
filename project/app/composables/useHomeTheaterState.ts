import { computed } from "vue";
import { useMutation, useQueryCache } from "@pinia/colada";
import { useHomeTheater } from "~/composables/useHomeTheater";
import {
  applyOptimisticHomeTheaterUpdate,
  invalidateHomeTheaterRelatedQueries,
  rollbackHomeTheaterUpdate,
  saveHomeTheater,
  type HomePayload,
  type SaveHomeInput,
} from "~/queries/home";

export const useHomeTheaterState = () => {
  const { data, refresh } = useHomeTheater();
  const queryCache = useQueryCache();

  const homeTheater = computed(() => data.value?.theater || null);
  const homeShows = computed(() => data.value?.shows || []);
  const homeCandidates = computed(() => data.value?.candidates || []);
  const homeId = computed(() => homeTheater.value?.id || null);
  const hasHome = computed(() => Boolean(homeId.value));

  const mutation = useMutation<
    void,
    SaveHomeInput,
    any,
    { previous?: HomePayload }
  >({
    mutation: saveHomeTheater,
    onMutate: ({ theaterId }) => ({
      previous: applyOptimisticHomeTheaterUpdate(queryCache, theaterId),
    }),
    onSuccess: () => invalidateHomeTheaterRelatedQueries(queryCache),
    onError: (_err, _vars, ctx) => {
      rollbackHomeTheaterUpdate(queryCache, ctx?.previous);
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
