import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const userId =
    user?.id ||
    (await supabase.auth
      .getUser()
      .then((r) => r.data.user?.id)
      .catch(() => null));

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const theaterId = body?.theaterId as string | null;

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

    const { error: followError } = await supabase
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
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ home_theater_id: theater.id })
    .eq("id", userId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return { theater };
});
