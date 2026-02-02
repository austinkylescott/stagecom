type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  pronouns?: string | null;
  bio?: string | null;
  city?: string | null;
  visibility?: "public" | "private" | "theater_only";
};

export const useUserIdentity = () => {
  const user = useSupabaseUser();
  const supabase = useSupabaseClient();

  const {
    data: profile,
    refresh: refreshProfile,
    pending: profilePending,
    error: profileError,
  } = useAsyncData<ProfileRow | null>(
    () => `current-profile-${user.value?.id || "anon"}`,
    async () => {
      const userId = user.value?.id;
      // Supabase sometimes hydrates a user shell before the id is available on the client.
      // Skip querying until we have a definite id to avoid "id=undefined" requests.
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, timezone, pronouns, bio, city, visibility",
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    {
      server: false,
      watch: [() => user.value?.id],
    },
  );

  const displayName = computed(() => {
    const meta = user.value?.user_metadata || {};
    const primaryName = (profile.value?.display_name || "").trim();
    if (primaryName) return primaryName;

    const metaName = (
      meta.display_name ||
      meta.full_name ||
      meta.name ||
      meta.user_name ||
      ""
    ).trim();
    if (metaName) return metaName;

    const email = user.value?.email || "";
    return email.split("@")[0] || "Anonymous";
  });

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

  return {
    user,
    displayName,
    initials,
    avatarUrl,
    email,
    isAuthed,
    profile,
    profilePending,
    profileError,
    refreshProfile,
  };
};
