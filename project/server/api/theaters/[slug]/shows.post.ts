import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums, TablesInsert } from "~/types/database.types";
import { buildShowEvent, emitEvent } from "~~/server/utils/notify";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import { generateUniqueSlug } from "~~/server/utils/slug";
import {
  normalizeLegacyOccurrenceInput,
  replaceShowOccurrences,
  replaceShowStaffAssignments,
  showDraftBodySchema,
  validateReviewReadiness,
} from "~~/server/utils/show-draft";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });

const legacyCompatibleBodySchema = showDraftBodySchema.extend({
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  submitForReview: z.coerce.boolean().optional().default(false),
});

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const parsedBody = await parseBody(event, legacyCompatibleBodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await requireUserId(event, supabase);

  const occurrences = normalizeLegacyOccurrenceInput({
    occurrences: parsedBody.occurrences,
    startsAt: parsedBody.startsAt,
    endsAt: parsedBody.endsAt,
  });

  const body = {
    ...parsedBody,
    occurrences,
  };

  if (body.submitForReview) {
    const readinessIssues = validateReviewReadiness(body);
    if (readinessIssues.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: readinessIssues.join(". "),
      });
    }
  }

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater?.id) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

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

  const status: Enums<"show_status"> = body.submitForReview
    ? "pending_review"
    : "draft";

  const showSlug = await generateUniqueSlug({
    baseValue: body.title,
    exists: async (candidate) => {
      const { data, error } = await supabase
        .from("shows")
        .select("id")
        .eq("theater_id", theater.id)
        .eq("slug", candidate)
        .maybeSingle();

      if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message });
      }

      return Boolean(data?.id);
    },
    fallback: "event",
  });

  const payload: TablesInsert<"shows"> = {
    theater_id: theater.id,
    slug: showSlug,
    title: body.title,
    summary: body.summary ?? null,
    description: body.description ?? null,
    producer_note: body.producerNote ?? null,
    poster_url: body.posterUrl ?? null,
    event_type: body.eventType,
    status,
    casting_mode: body.castingMode,
    is_public_listed: false,
    cast_min:
      body.castMin === undefined || body.castMin === null ? null : Number(body.castMin),
    cast_max:
      body.castMax === undefined || body.castMax === null ? null : Number(body.castMax),
    ticket_url: body.ticketUrl ?? null,
    on_sale_at: body.onSaleAt ?? null,
    created_by_user_id: userId,
  };

  const { data: show, error: showError } = await supabase
    .from("shows")
    .insert(payload)
    .select("id,slug")
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

  await replaceShowOccurrences({
    occurrences: body.occurrences,
    serviceSupabase,
    showId: show.id,
  });

  await replaceShowStaffAssignments({
    serviceSupabase,
    showId: show.id,
    staffAssignments: body.staffAssignments,
  });

  if (body.submitForReview) {
    const { error: reviewError } = await serviceSupabase
      .from("show_review_events")
      .insert({
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
          showSlug: show.slug,
          showTitle: body.title,
          theaterSlug: slug,
          recipientId: membershipRow.user_id,
          note: null,
        }),
      );
    }
  }

  return {
    id: show.id,
    slug: show.slug,
    theaterSlug: slug,
    status,
    submittedForReview: body.submitForReview,
  };
});
