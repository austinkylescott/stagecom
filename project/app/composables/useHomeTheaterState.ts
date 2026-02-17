import { computed } from "vue";
import { useHomeTheater } from "~/composables/useHomeTheater";
import { useHomeTheaterStore } from "~/stores/homeTheater";

export const useHomeTheaterState = () => {
  const { data, refresh } = useHomeTheater();
  const store = useHomeTheaterStore();

  const homeTheater = computed(() => data.value?.theater || store.theater || null);
  const homeShows = computed(() => data.value?.shows || store.shows || []);
  const homeCandidates = computed(() => data.value?.candidates || store.candidates || []);
  const homeId = computed(() => homeTheater.value?.id || store.theater?.id || null);
  const hasHome = computed(() => Boolean(homeId.value || store.theater?.id));

  const saveHome = async (theaterId: string | null) => {
    await $fetch("/api/me/home-theater", {
      method: "POST",
      credentials: "include",
      body: { theaterId },
    });
    await refresh();
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
