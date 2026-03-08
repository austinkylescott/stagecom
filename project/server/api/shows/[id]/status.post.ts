import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({
  action: z.enum(["approve", "reject", "changes_requested"]),
  reason: z.string().trim().min(1).optional(),
  note: z.string().trim().min(1).optional(),
});

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);
  const parsedParams = paramsSchema.safeParse(event.context.params);
  if (!parsedParams.success) {
    throw createError({ statusCode: 400, statusMessage: "Missing show id" });
  }
  const parsedBody = bodySchema.safeParse(await readBody(event));
  if (!parsedBody.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid action" });
  }
  const { id: showId } = parsedParams.data;
  const { action, reason, note } = parsedBody.data;

  // 1) Load show (need theater_id for permission check)
  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id,theater_id,status")
    .eq("id", showId)
    .maybeSingle();

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }
  if (!show) {
    throw createError({ statusCode: 404, statusMessage: "Show not found" });
  }

  // 2) Confirm user is theater staff/manager
  const { data: memberships, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("roles,status")
    .eq("theater_id", show.theater_id)
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  const isStaff = (memberships ?? []).some((m) => hasStaffRole(m.roles));
  if (!isStaff) {
    throw createError({ statusCode: 403, statusMessage: "Not allowed" });
  }

  // 3) Update show status and public listing flag
  let newStatus: Enums<"show_status">;
  if (action === "approve") newStatus = "approved";
  else if (action === "reject") newStatus = "rejected";
  else newStatus = "pending_review";

  const isPublicListed = action === "approve";

  const { error: updateError } = await supabase
    .from("shows")
    .update({
      status: newStatus,
      is_public_listed: isPublicListed,
    })
    .eq("id", showId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  // log review event
  const reviewAction: Enums<"review_action"> =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : "changes_requested";

  const { error: logError } = await supabase.from("show_review_events").insert({
    show_id: showId,
    action: reviewAction,
    actor_user_id: userId,
    note: note || reason || null,
  });

  if (logError) {
    throw createError({ statusCode: 500, statusMessage: logError.message });
  }

  return { status: newStatus, action: reviewAction };
});
