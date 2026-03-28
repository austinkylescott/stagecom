import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";
import { buildShowEvent, emitEvent } from "~~/server/utils/notify";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({
  action: z.enum([
    "submit_for_review",
    "approve",
    "reject",
    "changes_requested",
    "cancel",
    "reopen_draft",
  ]),
  reason: z.string().trim().min(1).optional(),
  note: z.string().trim().min(1).optional(),
});

const REVIEW_ACTIONS = new Set([
  "submit_for_review",
  "approve",
  "reject",
  "changes_requested",
]);

const TRANSITIONS: Record<
  z.infer<typeof bodySchema>["action"],
  {
    nextStatus: Enums<"show_status">;
    allowedFrom: Enums<"show_status">[];
    requiresStaff: boolean;
    requiresProducerOrStaff?: boolean;
    nextPublicListed: boolean;
    reviewAction?: Enums<"review_action">;
    notifyType?: "show.submitted_for_review" | "show.approved" | "show.rejected";
  }
> = {
  submit_for_review: {
    nextStatus: "pending_review",
    allowedFrom: ["draft", "rejected"],
    requiresStaff: false,
    requiresProducerOrStaff: true,
    nextPublicListed: false,
    reviewAction: "submitted",
    notifyType: "show.submitted_for_review",
  },
  approve: {
    nextStatus: "approved",
    allowedFrom: ["pending_review"],
    requiresStaff: true,
    nextPublicListed: true,
    reviewAction: "approved",
    notifyType: "show.approved",
  },
  reject: {
    nextStatus: "rejected",
    allowedFrom: ["pending_review"],
    requiresStaff: true,
    nextPublicListed: false,
    reviewAction: "rejected",
    notifyType: "show.rejected",
  },
  changes_requested: {
    nextStatus: "draft",
    allowedFrom: ["pending_review"],
    requiresStaff: true,
    nextPublicListed: false,
    reviewAction: "changes_requested",
  },
  cancel: {
    nextStatus: "cancelled",
    allowedFrom: ["draft", "pending_review", "approved", "rejected"],
    requiresStaff: false,
    requiresProducerOrStaff: true,
    nextPublicListed: false,
  },
  reopen_draft: {
    nextStatus: "draft",
    allowedFrom: ["cancelled", "rejected"],
    requiresStaff: false,
    requiresProducerOrStaff: true,
    nextPublicListed: false,
  },
};

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const { action, reason, note } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const actorUserId = await requireUserId(event, supabase);

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id,title,theater_id,status,theaters(slug)")
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
  const transition = TRANSITIONS[action];

  if (transition.requiresStaff && !isStaff) {
    throw createError({ statusCode: 403, statusMessage: "Not allowed" });
  }

  if (transition.requiresProducerOrStaff && !isProducer && !isStaff) {
    throw createError({ statusCode: 403, statusMessage: "Not allowed" });
  }

  if (!transition.allowedFrom.includes(show.status)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot ${action} from status ${show.status}`,
    });
  }

  const { error: updateError } = await supabase
    .from("shows")
    .update({
      status: transition.nextStatus,
      is_public_listed: transition.nextPublicListed,
    })
    .eq("id", showId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  if (transition.reviewAction) {
    const { error: reviewError } = await serviceSupabase.from("show_review_events").insert({
      show_id: showId,
      action: transition.reviewAction,
      actor_user_id: actorUserId,
      note: note || reason || null,
    });

    if (reviewError) {
      throw createError({
        statusCode: 500,
        statusMessage: reviewError.message,
      });
    }
  }

  const theaterSlug = Array.isArray(show.theaters)
    ? show.theaters[0]?.slug
    : show.theaters?.slug;

  if (transition.notifyType === "show.submitted_for_review") {
    const { data: staffMemberships, error: staffError } = await supabase
      .from("theater_memberships")
      .select("user_id,roles,status")
      .eq("theater_id", show.theater_id)
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
          showId,
          showTitle: show.title,
          theaterSlug: theaterSlug ?? "",
          recipientId: membershipRow.user_id,
          note: note || reason,
        }),
      );
    }
  }

  if (transition.notifyType === "show.approved" || transition.notifyType === "show.rejected") {
    const { data: producerRows, error: producerRowsError } = await supabase
      .from("show_roles")
      .select("user_id")
      .eq("show_id", showId)
      .eq("role", "producer");

    if (producerRowsError) {
      throw createError({
        statusCode: 500,
        statusMessage: producerRowsError.message,
      });
    }

    for (const producerRow of producerRows ?? []) {
      await emitEvent(
        buildShowEvent(transition.notifyType, {
          showId,
          showTitle: show.title,
          theaterSlug: theaterSlug ?? "",
          recipientId: producerRow.user_id,
          note: note || reason,
        }),
      );
    }
  }

  return {
    status: transition.nextStatus,
    action,
    reviewLogged: REVIEW_ACTIONS.has(action),
  };
});
