import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  emitEvent,
  buildCastEvent,
  type CastEventType,
} from "~~/server/utils/notify";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({
  action: z.enum(["accept", "approve", "decline", "withdraw", "remove"]),
  targetUserId: z.string().trim().min(1).optional(),
});

const ACTION_TO_EVENT: Partial<Record<string, CastEventType>> = {
  accept: "cast.accepted",
  decline: "cast.declined",
  withdraw: "cast.withdrawn",
  remove: "cast.removed_by_producer",
};

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const { action, targetUserId } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const actorId = await requireUserId(event, supabase);

  const subjectId =
    action === "remove" || action === "approve" ? targetUserId : actorId;
  if (!subjectId) {
    throw createError({
      statusCode: 400,
      statusMessage: "targetUserId required for producer cast actions",
    });
  }

  if (action === "remove" || action === "approve") {
    const { data: roleRow } = await supabase
      .from("show_roles")
      .select("role")
      .eq("show_id", showId)
      .eq("user_id", actorId)
      .maybeSingle();
    if (roleRow?.role !== "producer") {
      throw createError({
        statusCode: 403,
        statusMessage: "Only producers can manage performers",
      });
    }
  }

  const { data: castRow } = await supabase
    .from("show_cast")
    .select("status,source")
    .eq("show_id", showId)
    .eq("user_id", subjectId)
    .maybeSingle();

  if (!castRow)
    throw createError({
      statusCode: 404,
      statusMessage: "Cast entry not found",
    });

  const isValidTransition =
    (action === "accept" &&
      castRow.status === "pending" &&
      castRow.source === "invited") ||
    (action === "approve" &&
      castRow.status === "pending" &&
      castRow.source === "requested") ||
    (action === "decline" &&
      castRow.status === "pending" &&
      castRow.source === "invited") ||
    (action === "withdraw" &&
      (castRow.status === "accepted" ||
        (castRow.status === "pending" && castRow.source === "requested"))) ||
    (action === "remove" &&
      (castRow.status === "pending" || castRow.status === "accepted"));

  if (!isValidTransition) {
    throw createError({
      statusCode: 409,
      statusMessage: `Cannot ${action} from status ${castRow.status}`,
    });
  }

  const newStatus =
    action === "accept" || action === "approve"
      ? "accepted"
      : action === "decline"
        ? "declined"
        : action === "withdraw"
          ? "withdrawn"
          : "removed";

  const { error: updateError } = await supabase
    .from("show_cast")
    .update({ status: newStatus })
    .eq("show_id", showId)
    .eq("user_id", subjectId);

  if (updateError)
    throw createError({ statusCode: 500, statusMessage: updateError.message });

  const { data: show } = await supabase
    .from("shows")
    .select("id,title,theater_id,theaters(slug)")
    .eq("id", showId)
    .maybeSingle();

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", actorId)
    .maybeSingle();

  const theaterSlug = Array.isArray(show?.theaters)
    ? show.theaters[0]?.slug
    : (show?.theaters as any)?.slug;

  const eventBase = {
    showId,
    showTitle: show?.title ?? "",
    theaterSlug: theaterSlug ?? "",
    actorName: actorProfile?.display_name ?? "Someone",
  };

  if (action === "remove") {
    await emitEvent(
      buildCastEvent("cast.removed_by_producer", {
        ...eventBase,
        recipientId: subjectId,
      }),
    );
  } else if (action === "approve") {
    await emitEvent(
      buildCastEvent("cast.request_approved", {
        ...eventBase,
        recipientId: subjectId,
      }),
    );
  } else if (action !== "approve") {
    const { data: producerRows } = await supabase
      .from("show_roles")
      .select("user_id")
      .eq("show_id", showId)
      .eq("role", "producer");

    for (const producer of producerRows ?? []) {
      await emitEvent(
        buildCastEvent(ACTION_TO_EVENT[action]!, {
          ...eventBase,
          recipientId: producer.user_id,
        }),
      );
    }
  }

  return { status: newStatus };
});
