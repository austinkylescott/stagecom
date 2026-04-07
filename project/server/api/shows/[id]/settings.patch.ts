import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({
  isCastFinalized: z.boolean().optional(),
  isPublicListed: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const body = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const actorUserId = await requireUserId(event, supabase);

  if (body.isCastFinalized === undefined && body.isPublicListed === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "No settings provided",
    });
  }

  const [
    { data: roleRow, error: roleError },
    { data: showRow, error: showError },
    membershipResult,
  ] = await Promise.all([
    supabase
      .from("show_roles")
      .select("role")
      .eq("show_id", showId)
      .eq("user_id", actorUserId)
      .maybeSingle(),
    serviceSupabase
      .from("shows")
      .select("id,status,theater_id")
      .eq("id", showId)
      .maybeSingle(),
    supabase
      .from("theater_memberships")
      .select("theater_id,roles,status")
      .eq("user_id", actorUserId)
      .eq("status", "active"),
  ]);

  if (roleError) {
    throw createError({ statusCode: 500, statusMessage: roleError.message });
  }
  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }
  if (membershipResult.error) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipResult.error.message,
    });
  }
  if (!showRow) {
    throw createError({ statusCode: 404, statusMessage: "Show not found" });
  }

  const isProducer = roleRow?.role === "producer";
  const isTheaterStaff = (membershipResult.data ?? []).some(
    (membership) =>
      membership.status === "active" &&
      hasStaffRole(membership.roles) &&
      membership.theater_id === showRow.theater_id,
  );

  if (body.isCastFinalized !== undefined && !isProducer) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only producers can finalize cast",
    });
  }

  if (body.isPublicListed !== undefined) {
    if (!isTheaterStaff) {
      throw createError({
        statusCode: 403,
        statusMessage: "Only theater staff can manage publication",
      });
    }

    if (showRow.status !== "approved") {
      throw createError({
        statusCode: 409,
        statusMessage: "Only approved events can be published",
      });
    }
  }

  const updates: Record<string, unknown> = {};
  if (body.isCastFinalized !== undefined) {
    updates.is_cast_finalized = body.isCastFinalized;
  }
  if (body.isPublicListed !== undefined) {
    updates.is_public_listed = body.isPublicListed;
  }

  const { error: updateError } = await serviceSupabase
    .from("shows")
    .update(updates)
    .eq("id", showId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return {
    isCastFinalized: body.isCastFinalized,
    isPublicListed: body.isPublicListed,
  };
});
