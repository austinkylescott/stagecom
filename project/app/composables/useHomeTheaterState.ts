import { computed } from "vue";
import { useHomeTheater } from "~/composables/useHomeTheater";

export const useHomeTheaterState = () => {
  const { data, refresh: refreshHome } = useHomeTheater();

  const homeTheater = computed(() => data.value?.theater || null);
  const homeShows = computed(() => data.value?.shows || []);
  const homeCandidates = computed(() => data.value?.candidates || []);
  const homeId = computed(() => homeTheater.value?.id || null);
  const hasHome = computed(() => Boolean(homeId.value));

  return {
    data,
    refreshHome,
    homeTheater,
    homeShows,
    homeCandidates,
    homeId,
    hasHome,
  };
};
