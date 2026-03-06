import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Enums, TablesInsert } from "~/types/database.types";

/**
 * POST /api/theaters/:slug/shows
 * Create a show under a theater. Any authenticated user may create; creator is implied producer (handled later).
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

  const slug = String(event.context.params?.slug || "");
  const body = await readBody(event);
  const {
    title,
    description,
    castingMode,
    eventType,
    castMin,
    castMax,
    ticketUrl,
    startsAt,
    endsAt,
    submitForReview,
  } = body || {};

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing theater slug",
    });
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
  if (!theater.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Theater lookup missing id",
    });
  }

  const status: Enums<"show_status"> = submitForReview
    ? "pending_review"
    : "draft";

  // Ensure creator is at least an active member of the theater
  const { data: membership, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("status")
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
    throw createError({
      statusCode: 403,
      statusMessage: "Join the theater to create events",
    });
  }

  const allowedEventTypes: Enums<"event_type">[] = [
    "show",
    "practice",
    "meeting",
    "audition",
    "workshop",
  ];
  const event_type: Enums<"event_type"> = allowedEventTypes.includes(
    eventType as Enums<"event_type">,
  )
    ? (eventType as Enums<"event_type">)
    : "show";

  // Validate casting_mode against enum to avoid invalid inserts
  const allowedCastingModes: Enums<"casting_mode">[] = [
    "direct_invite",
    "theater_casting",
    "public_casting",
  ];
  const casting_mode: Enums<"casting_mode"> | null =
    allowedCastingModes.includes(castingMode as Enums<"casting_mode">)
      ? (castingMode as Enums<"casting_mode">)
      : null;

  if (!casting_mode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid casting mode",
    });
  }

  const payload: TablesInsert<"shows"> = {
    theater_id: theater.id,
    title,
    description,
    event_type,
    status,
    casting_mode,
    is_public_listed: false,
    cast_min:
      castMin === undefined || castMin === null ? null : Number(castMin),
    cast_max:
      castMax === undefined || castMax === null ? null : Number(castMax),
    ticket_url: ticketUrl || null,
    created_by_user_id: userId,
  };

  const { data: show, error: showError } = await supabase
    .from("shows")
    .insert(payload)
    .select("id")
    .single();

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }

  if (startsAt) {
    const startDate = new Date(startsAt);
    const endDate = endsAt ? new Date(endsAt) : null;

    if (Number.isNaN(startDate.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid start time",
      });
    }
    if (endDate && endDate <= startDate) {
      throw createError({
        statusCode: 400,
        statusMessage: "End time must be after start time",
      });
    }

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
