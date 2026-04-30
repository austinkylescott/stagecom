import { computed } from "vue";
import { useHomeTheater } from "~/composables/useHomeTheater";

export const useHomeTheaterState = () => {
  const { data, refresh: refreshHome } = useHomeTheater();

  const memberships = computed(() => data.value?.memberships || []);
  const homeTheaters = computed(() =>
    memberships.value.filter((entry) => entry.membership.isHome),
  );
  const candidateTheaters = computed(() =>
    memberships.value
      .filter((entry) => !entry.membership.isHome)
      .map((entry) => entry.theater),
  );
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
    memberships,
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
