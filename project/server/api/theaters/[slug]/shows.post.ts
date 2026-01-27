import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

/**
 * POST /api/theaters/:slug/shows
 * Create a show under a theater. Any authenticated user may create; creator is implied producer (handled later).
 */
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const slug = String(event.context.params?.slug || "");
  const body = await readBody(event);
  const { title, description, castingMode, startsAt, endsAt, submitForReview } = body || {};

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing theater slug" });
  }
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: "Title is required" });
  }

  // Lookup theater
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

  const status = submitForReview ? "pending_review" : "draft";

  const { data: show, error: showError } = await supabase
    .from("shows")
    .insert({
      theater_id: theater.id,
      title,
      description,
      status,
      casting_mode: castingMode,
      is_public_listed: false,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }

  if (startsAt) {
    const { error: occError } = await supabase.from("show_occurrences").insert({
      show_id: show.id,
      starts_at: startsAt,
      ends_at: endsAt || null,
      status: "scheduled",
    });

    if (occError) {
      throw createError({ statusCode: 500, statusMessage: occError.message });
    }
  }

  return { id: show.id, status };
});
