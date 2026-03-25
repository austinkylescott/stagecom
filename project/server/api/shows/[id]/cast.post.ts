import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { emitEvent, buildCastEvent } from "~~/server/utils/notify";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({ userId: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const { userId: targetUserId } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const actorId = await requireUserId(event, supabase);

  const { data: roleRow } = await supabase
    .from("show_roles")
    .select("role")
    .eq("show_id", showId)
    .eq("user_id", actorId)
    .maybeSingle();

  if (roleRow?.role !== "producer") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only producers can invite performers",
    });
  }

  const { data: show } = await supabase
    .from("shows")
    .select("id,title,theater_id,theaters(slug)")
    .eq("id", showId)
    .maybeSingle();

  if (!show)
    throw createError({ statusCode: 404, statusMessage: "Show not found" });

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id,display_name")
    .eq("id", targetUserId)
    .maybeSingle();

  if (!targetProfile)
    throw createError({ statusCode: 404, statusMessage: "User not found" });

  const { data: existing } = await supabase
    .from("show_cast")
    .select("status")
    .eq("show_id", showId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (existing && existing.status !== "removed") {
    throw createError({
      statusCode: 409,
      statusMessage: "Performer is already in cast",
    });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", actorId)
    .maybeSingle();

  const theaterSlug = Array.isArray(show.theaters)
    ? show.theaters[0]?.slug
    : (show.theaters as any)?.slug;

  if (existing?.status === "removed") {
    const { error } = await supabase
      .from("show_cast")
      .update({ status: "pending", source: "invited" })
      .eq("show_id", showId)
      .eq("user_id", targetUserId);
    if (error)
      throw createError({ statusCode: 500, statusMessage: error.message });
  } else {
    const { error } = await supabase.from("show_cast").insert({
      show_id: showId,
      user_id: targetUserId,
      source: "invited",
      status: "pending",
    });
    if (error)
      throw createError({ statusCode: 500, statusMessage: error.message });
  }

  await emitEvent(
    buildCastEvent("cast.invited", {
      showId,
      showTitle: show.title,
      theaterSlug: theaterSlug ?? "",
      actorName: actorProfile?.display_name ?? "A producer",
      recipientId: targetUserId,
    }),
  );

  return { status: "invited" };
});
