import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";
import { getServiceRoleClient } from "~~/server/utils/service-role";

/**
 * POST /api/theaters/:slug/membership
 * body: { action: "join" | "leave" }
 */
const paramsSchema = z.object({ slug: z.string().trim().min(1) });
const bodySchema = z.object({ action: z.enum(["join", "leave"]) });

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const { action } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const user = await requireUser(event, supabase);
  const userId = user.id;
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;

  // Ensure profile exists for FK
  await serviceSupabase.from("profiles").upsert(
    {
      id: userId,
      display_name:
        (typeof metadata.full_name === "string" ? metadata.full_name : null) ||
        (typeof metadata.name === "string" ? metadata.name : null) ||
        user.email ||
        "New user",
    },
    { onConflict: "id" },
  );

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
    const { error: upsertError } = await serviceSupabase
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
    const { error: deleteError } = await serviceSupabase
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

    const { data: remainingHomeMemberships } = await serviceSupabase
      .from("theater_memberships")
      .select("theater_id,home_rank")
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("is_home", true);

    const nextPrimaryHomeTheaterId =
      (remainingHomeMemberships ?? [])
        .slice()
        .sort(
          (left, right) =>
            (left.home_rank ?? Number.MAX_SAFE_INTEGER) -
            (right.home_rank ?? Number.MAX_SAFE_INTEGER),
        )[0]?.theater_id ?? null;

    await serviceSupabase
      .from("profiles")
      .update({ home_theater_id: nextPrimaryHomeTheaterId })
      .eq("id", userId);

    return { status: "left" };
  }

  throw createError({ statusCode: 400, statusMessage: "Invalid action" });
});
