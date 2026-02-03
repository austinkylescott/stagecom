import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Enums } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const showId = String(event.context.params?.id || "");
  const body = await readBody(event);
  const action = body?.action as "approve" | "reject" | "changes_requested";
  const reason = body?.reason as string | undefined;
  const note = body?.note as string | undefined;

  if (!showId) {
    throw createError({ statusCode: 400, statusMessage: "Missing show id" });
  }
  if (!action || !["approve", "reject", "changes_requested"].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid action" });
  }

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
    .eq("user_id", user.id)
    .eq("status", "active");

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  const staffRoles: Enums<"theater_role">[] = ["admin", "manager", "staff"];
  const isStaff = (memberships ?? []).some((m) =>
    (m.roles || []).some((r) => staffRoles.includes(r)),
  );
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
    actor_user_id: user.id,
    note: note || reason || null,
  });

  if (logError) {
    throw createError({ statusCode: 500, statusMessage: logError.message });
  }

  return { status: newStatus, action: reviewAction };
});
