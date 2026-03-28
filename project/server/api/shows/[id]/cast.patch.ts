import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  emitEvent,
  buildCastEvent,
  type CastEventType,
} from "~~/server/utils/notify";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({
  action: z.enum([
    "accept",
    "approve",
    "decline",
    "withdraw",
    "remove",
    "set_program_order",
  ]),
  targetUserId: z.string().trim().min(1).optional(),
  programOrder: z
    .preprocess(
      (value) => (value === null || value === undefined || value === "" ? null : value),
      z.coerce.number().int().min(1).nullable(),
    )
    .optional(),
});

const ACTION_TO_EVENT: Partial<Record<string, CastEventType>> = {
  accept: "cast.accepted",
  decline: "cast.declined",
  withdraw: "cast.withdrawn",
  remove: "cast.removed_by_producer",
};

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const { action, targetUserId, programOrder } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const actorId = await requireUserId(event, supabase);

  const subjectId =
    action === "remove" ||
    action === "approve" ||
    action === "set_program_order"
      ? targetUserId
      : actorId;
  if (!subjectId) {
    throw createError({
      statusCode: 400,
      statusMessage: "targetUserId required for producer cast actions",
    });
  }

  if (
    action === "remove" ||
    action === "approve" ||
    action === "set_program_order"
  ) {
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

  if (action === "set_program_order") {
    const { data: castRow, error: castLookupError } = await supabase
      .from("show_cast")
      .select("status")
      .eq("show_id", showId)
      .eq("user_id", subjectId)
      .maybeSingle();

    if (castLookupError) {
      throw createError({
        statusCode: 500,
        statusMessage: castLookupError.message,
      });
    }

    if (!castRow) {
      throw createError({
        statusCode: 404,
        statusMessage: "Cast entry not found",
      });
    }

    if (castRow.status !== "accepted") {
      throw createError({
        statusCode: 409,
        statusMessage: "Only accepted performers can be added to the program",
      });
    }

    const { data: acceptedCastRows, error: acceptedCastError } = await supabase
      .from("show_cast")
      .select("user_id,program_order")
      .eq("show_id", showId)
      .eq("status", "accepted");

    if (acceptedCastError) {
      throw createError({
        statusCode: 500,
        statusMessage: acceptedCastError.message,
      });
    }

    const acceptedMembers = (acceptedCastRows ?? []).map((row) => ({
      userId: row.user_id,
      programOrder: row.program_order,
    }));

    const orderedUserIds = acceptedMembers
      .filter((member) => member.userId !== subjectId && member.programOrder !== null)
      .sort((a, b) => {
        if (a.programOrder === null && b.programOrder === null) {
          return a.userId.localeCompare(b.userId);
        }
        if (a.programOrder === null) return 1;
        if (b.programOrder === null) return -1;
        if (a.programOrder !== b.programOrder) {
          return a.programOrder - b.programOrder;
        }
        return a.userId.localeCompare(b.userId);
      })
      .map((member) => member.userId);

    if (programOrder !== null && programOrder !== undefined) {
      const targetIndex = Math.max(
        0,
        Math.min(programOrder - 1, orderedUserIds.length),
      );
      orderedUserIds.splice(targetIndex, 0, subjectId);
    }

    const nextProgramOrderByUserId = new Map<string, number | null>();
    for (const [index, userId] of orderedUserIds.entries()) {
      nextProgramOrderByUserId.set(userId, index + 1);
    }

    for (const member of acceptedMembers) {
      if (!nextProgramOrderByUserId.has(member.userId)) {
        nextProgramOrderByUserId.set(member.userId, null);
      }
    }

    for (const member of acceptedMembers) {
      const nextProgramOrder = nextProgramOrderByUserId.get(member.userId) ?? null;

      if (member.programOrder === nextProgramOrder) {
        continue;
      }

      const { error: updateProgramOrderError } = await supabase
        .from("show_cast")
        .update({ program_order: nextProgramOrder })
        .eq("show_id", showId)
        .eq("user_id", member.userId);

      if (updateProgramOrderError) {
        throw createError({
          statusCode: 500,
          statusMessage: updateProgramOrderError.message,
        });
      }
    }

    return {
      status: "accepted",
      programOrder: nextProgramOrderByUserId.get(subjectId) ?? null,
    };
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
