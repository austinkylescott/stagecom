import { defineQueryOptions } from "@pinia/colada";
import { useSupabaseClient } from "#imports";
import { queryKeys } from "~/composables/queryKeys";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  pronouns?: string | null;
  bio?: string | null;
  city?: string | null;
  visibility?: "public" | "private" | "theater_only";
};

export const profileQueryOptions = defineQueryOptions<
  { userId: string },
  ProfileRow | null
>((params) => ({
  key: queryKeys.profile(params?.userId || ""),
  query: async () => {
    if (import.meta.server) return null;
    if (!params?.userId) return null;

    const supabase = useSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, display_name, avatar_url, timezone, pronouns, bio, city, visibility",
      )
      .eq("id", params.userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  enabled: Boolean(params?.userId),
  staleTime: 30_000,
}));
