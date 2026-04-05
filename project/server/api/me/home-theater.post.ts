import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const bodySchema = z.object({
  isHome: z.boolean().optional(),
  theaterId: z.string().trim().min(1).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const { isHome, theaterId: parsedTheaterId } = await parseBody(
    event,
    bodySchema,
  );
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await requireUserId(event, supabase);
  const theaterId = parsedTheaterId ?? null;

  if (!theaterId) {
    const { error: clearError } = await serviceSupabase
      .from("theater_memberships")
      .update({ home_rank: null, is_home: false })
      .eq("user_id", userId);

    if (clearError) {
      throw createError({ statusCode: 500, statusMessage: clearError.message });
    }

    await serviceSupabase
      .from("profiles")
      .update({ home_theater_id: null })
      .eq("id", userId);

    return { isHome: false, theaterId: null };
  }

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id")
    .eq("id", theaterId)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }

  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("theater_id,is_home,status")
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
      statusMessage: "Join the theater before marking it as home",
    });
  }

  const desiredHomeState = isHome ?? !membership.is_home;
  let nextHomeRank: number | null = null;

  if (desiredHomeState) {
    const { data: existingHomeMemberships, error: homeMembershipsError } =
      await supabase
        .from("theater_memberships")
        .select("home_rank")
        .eq("user_id", userId)
        .eq("status", "active")
        .eq("is_home", true);

    if (homeMembershipsError) {
      throw createError({
        statusCode: 500,
        statusMessage: homeMembershipsError.message,
      });
    }

    nextHomeRank =
      (existingHomeMemberships ?? []).reduce(
        (maxRank, item) => Math.max(maxRank, item.home_rank ?? 0),
        0,
      ) + 1;
  }

  const { error: updateError } = await serviceSupabase
    .from("theater_memberships")
    .update({
      home_rank: desiredHomeState ? nextHomeRank : null,
      is_home: desiredHomeState,
    })
    .eq("theater_id", theater.id)
    .eq("user_id", userId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  const { data: homeMemberships, error: refreshedHomeError } = await supabase
    .from("theater_memberships")
    .select("theater_id,home_rank")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("is_home", true);

  if (refreshedHomeError) {
    throw createError({
      statusCode: 500,
      statusMessage: refreshedHomeError.message,
    });
  }

  const primaryHomeTheaterId =
    (homeMemberships ?? [])
      .slice()
      .sort(
        (left, right) =>
          (left.home_rank ?? Number.MAX_SAFE_INTEGER) -
          (right.home_rank ?? Number.MAX_SAFE_INTEGER),
      )[0]?.theater_id ?? null;

  await serviceSupabase
    .from("profiles")
    .update({ home_theater_id: primaryHomeTheaterId })
    .eq("id", userId);

  return { isHome: desiredHomeState, theaterId: theater.id };
});
