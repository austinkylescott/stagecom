import { computed } from "vue";
import { useHomeTheater } from "~/composables/useHomeTheater";

export const useHomeTheaterState = () => {
  const { data, refresh: refreshHome } = useHomeTheater();

  const homeTheaters = computed(() => data.value?.homeTheaters || []);
  const candidateTheaters = computed(() => data.value?.candidateTheaters || []);
  const primaryHome = computed(() => homeTheaters.value[0] || null);
  const homeTheater = computed(() => primaryHome.value?.theater || null);
  const homeMembership = computed(
    () => primaryHome.value?.membership || { isHome: false, roles: [], status: null },
  );
  const homePermissions = computed(
    () =>
      primaryHome.value?.permissions || {
        canCreateShow: false,
        canReview: false,
      },
  );
  const homeIds = computed(() => homeTheaters.value.map((entry) => entry.theater.id));
  const homeId = computed(() => homeIds.value[0] || null);
  const hasHome = computed(() => homeTheaters.value.length > 0);

  return {
    candidateTheaters,
    data,
    refreshHome,
    homeIds,
    homeTheaters,
    homeTheater,
    homeMembership,
    homePermissions,
    homeId,
    hasHome,
    primaryHome,
  };
};
