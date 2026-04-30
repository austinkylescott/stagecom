import { useQuery, useQueryCache } from "@pinia/colada";
import { computed, watch } from "vue";
import { queryKeys } from "~/composables/queryKeys";
import { profileQueryOptions, type ProfileRow } from "~/queries/users";
import { deriveProfileDisplayName } from "~~/shared/profile";

export type { ProfileRow } from "~/queries/users";

export const useUserIdentity = () => {
  const user = useSupabaseUser();
  const queryCache = useQueryCache();

  const params = computed(() => ({ userId: user.value?.id || "" }));

  const {
    data: profile,
    refresh: refreshProfile,
    isLoading,
    error: profileError,
  } = useQuery(profileQueryOptions, params);

  const displayName = computed(() =>
    deriveProfileDisplayName({
      profileDisplayName: profile.value?.display_name,
      userMetadata:
        (user.value?.user_metadata as Record<string, unknown> | undefined) ||
        null,
      email: user.value?.email || null,
    }),
  );

  const initials = computed(() => {
    const parts = displayName.value.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  });

  const avatarUrl = computed(() => {
    return (
      profile.value?.avatar_url || user.value?.user_metadata?.avatar_url || null
    );
  });

  const email = computed(() => user.value?.email || "");
  const isAuthed = computed(() => !!user.value);

  const setProfile = (nextProfile: ProfileRow | null) => {
    const userId = params.value.userId;
    if (!userId) return;

    queryCache.setQueryData(queryKeys.profile(userId), nextProfile);
  };

  watch(
    () => user.value?.id || "",
    async (userId, previousUserId) => {
      if (!userId || userId === previousUserId) return;
      await refreshProfile();
    },
    { immediate: true },
  );

  return {
    user,
    displayName,
    initials,
    avatarUrl,
    email,
    isAuthed,
    profile,
    isLoading,
    profileError,
    refreshProfile,
    setProfile,
  };
};
