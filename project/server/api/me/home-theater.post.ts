import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const bodySchema = z.object({
  theaterId: z.string().trim().min(1).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { theaterId: parsedTheaterId } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await requireUserId(event, supabase);
  const theaterId = parsedTheaterId ?? null;

  // Clear home
  if (!theaterId) {
    const { error: clearError } = await serviceSupabase
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

  // Ensure user has active membership in theater. If missing, auto-follow as member.
  const { data: membership, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("theater_id,status,roles")
    .eq("theater_id", theater.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  if (!membership || membership.status !== "active") {
    const upsertPayload = {
      theater_id: theater.id,
      user_id: userId,
      roles: membership?.roles?.length ? membership.roles : ["member" as const],
      status: "active" as const,
    };

    const { error: followError } = await serviceSupabase
      .from("theater_memberships")
      .upsert(upsertPayload, { onConflict: "theater_id,user_id" });

    if (followError) {
      throw createError({
        statusCode: 500,
        statusMessage: followError.message,
      });
    }
  }

  // Update profile
  const { error: updateError } = await serviceSupabase
    .from("profiles")
    .update({ home_theater_id: theater.id })
    .eq("id", userId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return { theater };
});
