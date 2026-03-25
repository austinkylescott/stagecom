import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

const paramsSchema = z.object({ id: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const userId = await getOptionalUserId(event, supabase);

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select(
      "id,title,description,status,event_type,casting_mode,cast_min,cast_max,is_cast_finalized,is_public_listed,ticket_url,on_sale_at,theater_id,created_by_user_id",
    )
    .eq("id", showId)
    .maybeSingle();

  if (showError)
    throw createError({ statusCode: 500, statusMessage: showError.message });
  if (!show)
    throw createError({ statusCode: 404, statusMessage: "Show not found" });

  const { data: theater } = await supabase
    .from("theaters")
    .select("id,name,slug")
    .eq("id", show.theater_id)
    .maybeSingle();

  const { data: occurrences } = await supabase
    .from("show_occurrences")
    .select("id,starts_at,ends_at,status")
    .eq("show_id", showId)
    .order("starts_at", { ascending: true });

  let isProducer = false;
  if (userId) {
    const { data: roleRow } = await supabase
      .from("show_roles")
      .select("role")
      .eq("show_id", showId)
      .eq("user_id", userId)
      .maybeSingle();
    isProducer = roleRow?.role === "producer";
  }

  let castQuery = supabase
    .from("show_cast")
    .select(
      "user_id,source,status,program_order,note,profiles(id,display_name,avatar_url)",
    )
    .eq("show_id", showId)
    .order("program_order", { ascending: true, nullsFirst: false });

  if (!isProducer) {
    if (userId) {
      castQuery = castQuery.or(`status.eq.accepted,user_id.eq.${userId}`);
    } else {
      castQuery = castQuery.eq("status", "accepted");
    }
  }

  const { data: castRows } = await castQuery;

  const cast = (castRows ?? []).map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return {
      userId: row.user_id,
      source: row.source,
      status: row.status,
      programOrder: row.program_order,
      note: row.note,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  });

  return {
    show: {
      id: show.id,
      title: show.title,
      description: show.description,
      status: show.status,
      eventType: show.event_type,
      castingMode: show.casting_mode,
      castMin: show.cast_min,
      castMax: show.cast_max,
      isCastFinalized: show.is_cast_finalized,
      isPublicListed: show.is_public_listed,
      ticketUrl: show.ticket_url,
      onSaleAt: show.on_sale_at,
      theaterId: show.theater_id,
      theaterName: theater?.name ?? null,
      theaterSlug: theater?.slug ?? null,
    },
    occurrences: occurrences ?? [],
    cast,
    permissions: { isProducer },
  };
});
