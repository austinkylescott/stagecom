import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  MAX_THEATER_UPCOMING_ITEMS_LIMIT,
  MIN_THEATER_UPCOMING_ITEMS_LIMIT,
} from "~~/shared/theater-board-settings";
import { hasStaffRole } from "~~/server/utils/permissions";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });
const bodySchema = z.object({
  upcomingOtherEventsLimit: z
    .number()
    .int()
    .min(MIN_THEATER_UPCOMING_ITEMS_LIMIT)
    .max(MAX_THEATER_UPCOMING_ITEMS_LIMIT)
    .optional(),
  upcomingShowsLimit: z
    .number()
    .int()
    .min(MIN_THEATER_UPCOMING_ITEMS_LIMIT)
    .max(MAX_THEATER_UPCOMING_ITEMS_LIMIT)
    .optional(),
});

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const body = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const actorUserId = await requireUserId(event, supabase);

  if (
    body.upcomingShowsLimit === undefined &&
    body.upcomingOtherEventsLimit === undefined
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "No theater board settings provided",
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

  const { data: membershipRow, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("status,roles")
    .eq("theater_id", theater.id)
    .eq("user_id", actorUserId)
    .maybeSingle();

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  const canManageBoardSettings =
    membershipRow?.status === "active" && hasStaffRole(membershipRow.roles ?? []);

  if (!canManageBoardSettings) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only theater oversight roles can update theater board settings",
    });
  }

  const updatePayload: {
    upcoming_other_events_limit?: number;
    upcoming_shows_limit?: number;
  } = {};

  if (body.upcomingOtherEventsLimit !== undefined) {
    updatePayload.upcoming_other_events_limit = body.upcomingOtherEventsLimit;
  }

  if (body.upcomingShowsLimit !== undefined) {
    updatePayload.upcoming_shows_limit = body.upcomingShowsLimit;
  }

  const { data: updatedTheater, error: updateError } = await supabase
    .from("theaters")
    .update(updatePayload)
    .eq("id", theater.id)
    .select("upcoming_shows_limit,upcoming_other_events_limit")
    .maybeSingle();

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return {
    boardSettings: {
      upcomingOtherEventsLimit:
        updatedTheater?.upcoming_other_events_limit ??
        body.upcomingOtherEventsLimit,
      upcomingShowsLimit:
        updatedTheater?.upcoming_shows_limit ?? body.upcomingShowsLimit,
    },
  };
});
