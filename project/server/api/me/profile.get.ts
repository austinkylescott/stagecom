import { serverSupabaseClient } from "#supabase/server";
import type { Enums } from "~/types/database.types";

type MeProfileResponse = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  pronouns: string | null;
  bio: string | null;
  city: string | null;
  visibility: Enums<"profile_visibility">;
} | null;

export default defineEventHandler(async (event): Promise<MeProfileResponse> => {
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, timezone, pronouns, bio, city, visibility",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data;
});
