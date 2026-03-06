import { defineQueryOptions } from "@pinia/colada";
import { useSupabaseClient } from "#imports";
import { queryKeys } from "~/composables/queryKeys";

export type PerformersResponse = {
  profiles: any[];
  memberships: any[];
};

export const performersQueryOptions = defineQueryOptions<void, PerformersResponse>(
  () => ({
    key: queryKeys.performers(),
    query: async () => {
      if (import.meta.server) return { profiles: [], memberships: [] };

      const supabase = useSupabaseClient();
      const [profilesRes, membershipsRes] = await Promise.all([
        supabase.from("profiles").select("id,display_name,avatar_url"),
        supabase
          .from("theater_memberships")
          .select("user_id,theater_id,status")
          .eq("status", "active"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (membershipsRes.error) throw membershipsRes.error;

      return {
        profiles: profilesRes.data || [],
        memberships: membershipsRes.data || [],
      } satisfies PerformersResponse;
    },
    staleTime: 30_000,
  }) as const,
);
