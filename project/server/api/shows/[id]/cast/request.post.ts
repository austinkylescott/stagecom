import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { buildCastEvent, emitEvent } from "~~/server/utils/notify";

const paramsSchema = z.object({ id: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const actorId = await requireUserId(event, supabase);

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id,slug,title,casting_mode,theater_id,theaters(slug)")
    .eq("id", showId)
    .maybeSingle();

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }
  if (!show) {
    throw createError({ statusCode: 404, statusMessage: "Show not found" });
  }

  if (show.casting_mode === "direct_invite") {
    throw createError({
      statusCode: 403,
      statusMessage: "This show does not accept cast requests",
    });
  }

  const { data: producerRole } = await supabase
    .from("show_roles")
    .select("role")
    .eq("show_id", showId)
    .eq("user_id", actorId)
    .maybeSingle();

  if (producerRole?.role === "producer") {
    throw createError({
      statusCode: 409,
      statusMessage: "Producers cannot request their own show",
    });
  }

  if (show.casting_mode === "theater_casting") {
    const { data: membership } = await supabase
      .from("theater_memberships")
      .select("status")
      .eq("theater_id", show.theater_id)
      .eq("user_id", actorId)
      .eq("status", "active")
      .maybeSingle();

    if (membership?.status !== "active") {
      throw createError({
        statusCode: 403,
        statusMessage: "Only active theater members can request this show",
      });
    }
  }

  const { data: existing } = await supabase
    .from("show_cast")
    .select("status")
    .eq("show_id", showId)
    .eq("user_id", actorId)
    .maybeSingle();

  if (existing?.status === "pending" || existing?.status === "accepted") {
    throw createError({
      statusCode: 409,
      statusMessage: "You already have an active cast entry for this show",
    });
  }

  if (existing?.status === "removed") {
    throw createError({
      statusCode: 409,
      statusMessage: "You cannot request this show again right now",
    });
  }

  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", actorId)
    .maybeSingle();

  if (existing?.status === "declined" || existing?.status === "withdrawn") {
    const { error: updateError } = await supabase
      .from("show_cast")
      .update({ source: "requested", status: "pending" })
      .eq("show_id", showId)
      .eq("user_id", actorId);

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: updateError.message,
      });
    }
  } else {
    const { error: insertError } = await supabase.from("show_cast").insert({
      show_id: showId,
      user_id: actorId,
      source: "requested",
      status: "pending",
    });

    if (insertError) {
      throw createError({
        statusCode: 500,
        statusMessage: insertError.message,
      });
    }
  }

  const { data: producerRows } = await supabase
    .from("show_roles")
    .select("user_id")
    .eq("show_id", showId)
    .eq("role", "producer");

  const theaterSlug = Array.isArray(show.theaters)
    ? show.theaters[0]?.slug
    : (show.theaters as any)?.slug;
  const requestCycleId = new Date().toISOString();

  for (const producer of producerRows ?? []) {
    await emitEvent(
      buildCastEvent("cast.requested", {
        showId,
        showSlug: show.slug,
        showTitle: show.title,
        theaterSlug: theaterSlug ?? "",
        actorId,
        actorName: actorProfile?.display_name ?? "Someone",
        recipientId: producer.user_id,
        requestCycleId,
      }),
    );
  }

  return { status: "pending", source: "requested" };
});
