import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import {
  replaceShowOccurrences,
  replaceShowStaffAssignments,
  showDraftBodySchema,
} from "~~/server/utils/show-draft";

const paramsSchema = z.object({ id: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const body = await parseBody(event, showDraftBodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const actorUserId = await requireUserId(event, supabase);

  const { data: show, error: showError } = await serviceSupabase
    .from("shows")
    .select("id,theater_id")
    .eq("id", showId)
    .maybeSingle();

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }

  if (!show) {
    throw createError({ statusCode: 404, statusMessage: "Show not found" });
  }

  const [membershipResult, producerRoleResult] = await Promise.all([
    supabase
      .from("theater_memberships")
      .select("roles,status")
      .eq("theater_id", show.theater_id)
      .eq("user_id", actorUserId)
      .eq("status", "active"),
    supabase
      .from("show_roles")
      .select("role")
      .eq("show_id", showId)
      .eq("user_id", actorUserId)
      .maybeSingle(),
  ]);

  if (membershipResult.error) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipResult.error.message,
    });
  }

  if (producerRoleResult.error) {
    throw createError({
      statusCode: 500,
      statusMessage: producerRoleResult.error.message,
    });
  }

  const isStaff = (membershipResult.data ?? []).some((membership) =>
    hasStaffRole(membership.roles),
  );
  const isProducer = producerRoleResult.data?.role === "producer";

  if (!isProducer && !isStaff) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only producers or theater staff can update event setup",
    });
  }

  const { error: updateError } = await serviceSupabase
    .from("shows")
    .update({
      title: body.title,
      summary: body.summary ?? null,
      description: body.description ?? null,
      producer_note: body.producerNote ?? null,
      poster_url: body.posterUrl ?? null,
      event_type: body.eventType,
      casting_mode: body.castingMode,
      cast_min:
        body.castMin === undefined || body.castMin === null ? null : Number(body.castMin),
      cast_max:
        body.castMax === undefined || body.castMax === null ? null : Number(body.castMax),
      ticket_url: body.ticketUrl ?? null,
      on_sale_at: body.onSaleAt ?? null,
    })
    .eq("id", showId);

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: updateError.message,
    });
  }

  await replaceShowOccurrences({
    occurrences: body.occurrences,
    serviceSupabase,
    showId,
  });

  await replaceShowStaffAssignments({
    serviceSupabase,
    showId,
    staffAssignments: body.staffAssignments,
  });

  return {
    id: showId,
    updated: true,
  };
});
