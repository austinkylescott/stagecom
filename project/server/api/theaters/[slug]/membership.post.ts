import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Enums } from "~/types/database.types";

/**
 * POST /api/theaters/:slug/membership
 * body: { action: "join" | "leave" }
 */
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

  // Ensure profile exists for FK
  await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name:
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        "New user",
    },
    { onConflict: "id" },
  );

  const slug = String(event.context.params?.slug || "");
  const body = await readBody(event);
  const action = body?.action as "join" | "leave";

  if (!slug || !action) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing slug or action",
    });
  }

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  if (action === "join") {
    const roles: Enums<"theater_role">[] = ["member"];
    const { error: upsertError } = await supabase
      .from("theater_memberships")
      .upsert(
        {
          theater_id: theater.id,
          user_id: userId,
          roles,
          status: "active",
        },
        { onConflict: "theater_id,user_id" },
      );

    if (upsertError) {
      throw createError({
        statusCode: 500,
        statusMessage: upsertError.message,
      });
    }

    return { status: "joined", roles };
  }

  if (action === "leave") {
    const { error: deleteError } = await supabase
      .from("theater_memberships")
      .delete()
      .eq("theater_id", theater.id)
      .eq("user_id", userId);

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: deleteError.message,
      });
    }

    // If the user is leaving their current home theater, clear it.
    const { data: profile } = await supabase
      .from("profiles")
      .select("home_theater_id")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.home_theater_id === theater.id) {
      await supabase
        .from("profiles")
        .update({ home_theater_id: null })
        .eq("id", userId);
    }
    return { status: "left" };
  }

  throw createError({ statusCode: 400, statusMessage: "Invalid action" });
});
