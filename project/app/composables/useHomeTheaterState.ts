import { computed } from "vue";
import { useHomeTheater } from "~/composables/useHomeTheater";

export const useHomeTheaterState = () => {
  const { data, refresh: refreshHome } = useHomeTheater();

  const homeTheater = computed(() => data.value?.theater || null);
  const homeShows = computed(() => data.value?.shows || []);
  const homeCandidates = computed(() => data.value?.candidates || []);
  const homeMembership = computed(() => data.value?.membership || { status: null, roles: [] });
  const homePermissions = computed(
    () =>
      data.value?.permissions || {
        isMember: false,
        canCreateShow: false,
        canReview: false,
      },
  );
  const homeStats = computed(
    () =>
      data.value?.stats || {
        pendingReviewCount: 0,
        publicShowCount: 0,
        upcomingPublicCount: 0,
      },
  );
  const homeId = computed(() => homeTheater.value?.id || null);
  const hasHome = computed(() => Boolean(homeId.value));

  return {
    data,
    refreshHome,
    homeTheater,
    homeShows,
    homeCandidates,
    homeMembership,
    homePermissions,
    homeStats,
    homeId,
    hasHome,
  };
};
