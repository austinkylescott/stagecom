import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums, TablesInsert } from "~/types/database.types";
import { buildShowEvent, emitEvent } from "~~/server/utils/notify";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";

/**
 * POST /api/theaters/:slug/shows
 * Create a show under a theater for an active theater member; creator is implied producer (handled later).
 */
const paramsSchema = z.object({ slug: z.string().trim().min(1) });
const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const emptyToNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
};

const normalizeDateInput = (value: unknown) => {
  const normalized = emptyToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized !== "string") return normalized;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return normalized;

  return date.toISOString();
};

const bodySchema = z
  .object({
    title: z.string().trim().min(1),
    description: z
      .preprocess(emptyToNull, z.string().trim().nullable())
      .optional(),
    castingMode: z.enum(["direct_invite", "theater_casting", "public_casting"]),
    eventType: z
      .enum(["show", "practice", "meeting", "audition", "workshop"])
      .optional()
      .default("show"),
    castMin: z
      .preprocess(emptyToNull, z.coerce.number().int().min(0).nullable())
      .optional(),
    castMax: z
      .preprocess(emptyToNull, z.coerce.number().int().min(0).nullable())
      .optional(),
    ticketUrl: z
      .preprocess(emptyToNull, z.string().trim().url().nullable())
      .optional(),
    startsAt: z
      .preprocess(normalizeDateInput, z.string().datetime())
      .optional(),
    endsAt: z.preprocess(normalizeDateInput, z.string().datetime()).optional(),
    submitForReview: z.coerce.boolean().optional().default(false),
  })
  .refine(
    (data) =>
      data.castMin === null ||
      data.castMin === undefined ||
      data.castMax === null ||
      data.castMax === undefined ||
      data.castMin <= data.castMax,
    {
      message: "Cast min cannot exceed cast max",
      path: ["castMax"],
    },
  );

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
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
  } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await requireUserId(event, supabase);

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

  const event_type: Enums<"event_type"> = eventType;
  const casting_mode: Enums<"casting_mode"> = castingMode;

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

  const { error: producerRoleError } = await supabase
    .from("show_roles")
    .insert({
      show_id: show.id,
      user_id: userId,
      role: "producer",
    });

  if (producerRoleError) {
    throw createError({
      statusCode: 500,
      statusMessage: producerRoleError.message,
    });
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

  if (submitForReview) {
    const { error: reviewError } = await serviceSupabase.from("show_review_events").insert({
      show_id: show.id,
      action: "submitted",
      actor_user_id: userId,
      note: null,
    });

    if (reviewError) {
      throw createError({
        statusCode: 500,
        statusMessage: reviewError.message,
      });
    }

    const { data: theaterInfo, error: theaterInfoError } = await supabase
      .from("theaters")
      .select("slug")
      .eq("id", theater.id)
      .maybeSingle();

    if (theaterInfoError) {
      throw createError({
        statusCode: 500,
        statusMessage: theaterInfoError.message,
      });
    }

    const { data: staffMemberships, error: staffError } = await supabase
      .from("theater_memberships")
      .select("user_id,roles,status")
      .eq("theater_id", theater.id)
      .eq("status", "active");

    if (staffError) {
      throw createError({
        statusCode: 500,
        statusMessage: staffError.message,
      });
    }

    for (const membershipRow of staffMemberships ?? []) {
      if (!hasStaffRole(membershipRow.roles)) continue;

      await emitEvent(
        buildShowEvent("show.submitted_for_review", {
          showId: show.id,
          showTitle: title,
          theaterSlug: theaterInfo?.slug ?? slug,
          recipientId: membershipRow.user_id,
        }),
      );
    }
  }

  return { id: show.id, status };
});
