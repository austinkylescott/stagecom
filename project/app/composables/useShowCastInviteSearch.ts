import { watchDebounced } from "@vueuse/core";
import { computed, ref, toValue, type MaybeRefOrGetter } from "vue";
import { usePerformers } from "~/composables/usePerformers";
import type { ShowCastMember } from "~/composables/useShowCast";

export const useShowCastInviteSearch = ({
  theaterId,
  cast,
  viewerCast,
}: {
  theaterId: MaybeRefOrGetter<string>;
  cast: MaybeRefOrGetter<ShowCastMember[]>;
  viewerCast?: MaybeRefOrGetter<ShowCastMember | null | undefined>;
}) => {
  const searchInput = ref("");
  const search = ref("");
  const page = ref(1);
  const scopeAll = ref(false);

  watchDebounced(
    searchInput,
    (value) => {
      search.value = value.trim();
      page.value = 1;
    },
    { debounce: 300, maxWait: 800 },
  );

  const theaterIdRef = computed(() =>
    scopeAll.value ? undefined : toValue(theaterId),
  );

  const { data: performerData, isLoading: searchLoading } = usePerformers({
    search,
    page,
    theaterId: theaterIdRef,
  });

  const alreadyCastIds = computed(
    () =>
      new Set(
        [...toValue(cast), ...(toValue(viewerCast) ? [toValue(viewerCast)] : [])]
          .filter((member) =>
            member.status === "pending" || member.status === "accepted",
          )
          .map((member) => member.userId),
      ),
  );

  const filteredResults = computed(() => {
    const profiles = performerData.value?.profiles ?? [];
    const memberships = performerData.value?.memberships ?? [];
    const memberSet = new Set(
      memberships
        .filter((membership) => membership.theater_id === toValue(theaterId))
        .map((membership) => membership.user_id),
    );

    return profiles.map((profile) => ({
      ...profile,
      isMember: memberSet.has(profile.id),
      alreadyCast: alreadyCastIds.value.has(profile.id),
    }));
  });

  return {
    filteredResults,
    scopeAll,
    search,
    searchInput,
    searchLoading,
  };
};
