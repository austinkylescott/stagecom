import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

const bodySchema = z.object({
  theaterId: z.string().trim().min(1).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { theaterId: parsedTheaterId } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);
  const theaterId = parsedTheaterId ?? null;

  // Clear home
  if (!theaterId) {
    const { error: clearError } = await supabase
      .from("profiles")
      .update({ home_theater_id: null })
      .eq("id", userId);

    if (clearError) {
      throw createError({ statusCode: 500, statusMessage: clearError.message });
    }

    return { theater: null };
  }

  // Validate theater exists
  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug,tagline,city,state_region,country")
    .eq("id", theaterId)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  // Home theater is a preference only; it must not create or upgrade membership.
  const { data: membership, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("theater_id,status")
    .eq("theater_id", theater.id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  if (!membership) {
    throw createError({
      statusCode: 403,
      statusMessage: "Join the theater before setting it as home",
    });
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ home_theater_id: theater.id })
    .eq("id", userId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return { theater };
});
