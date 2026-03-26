import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const paramsSchema = z.object({ id: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
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

  const { data: producerRows } = await supabase
    .from("show_roles")
    .select("user_id,profiles(display_name,avatar_url)")
    .eq("show_id", showId)
    .eq("role", "producer");

  let isProducer = false;
  let canRequestToJoin = false;
  let isTheaterStaff = false;
  if (userId) {
    const { data: roleRow } = await supabase
      .from("show_roles")
      .select("role")
      .eq("show_id", showId)
      .eq("user_id", userId)
      .maybeSingle();
    isProducer = roleRow?.role === "producer";

    const { data: membershipRow } = await supabase
      .from("theater_memberships")
      .select("status,roles")
      .eq("theater_id", show.theater_id)
      .eq("user_id", userId)
      .maybeSingle();

    const isActiveMember = membershipRow?.status === "active";
    isTheaterStaff = isActiveMember && hasStaffRole(membershipRow?.roles);

    if (!isProducer && show.casting_mode !== "direct_invite") {
      canRequestToJoin =
        show.casting_mode === "public_casting" ? true : isActiveMember;
    }
  }

  let viewerCastRow: {
    user_id: string;
    source: "invited" | "requested";
    status: "pending" | "accepted" | "declined" | "withdrawn" | "removed";
    program_order: number | null;
    note: string | null;
  } | null = null;

  if (userId && !isProducer) {
    const { data, error } = await serviceSupabase
      .from("show_cast")
      .select("user_id,source,status,program_order,note")
      .eq("show_id", showId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    viewerCastRow = data;
  }

  const isViewerInvolved =
    isProducer ||
    isTheaterStaff ||
    viewerCastRow?.status === "accepted" ||
    (viewerCastRow?.status === "pending" && viewerCastRow?.source === "invited");
  const canSeePendingCast = isViewerInvolved;

  let castQuery = supabase
    .from("show_cast")
    .select(
      "user_id,source,status,program_order,note,profiles(id,display_name,avatar_url)",
    )
    .eq("show_id", showId)
    .order("program_order", { ascending: true, nullsFirst: false });

  if (isProducer) {
    // Producers need the full cast state, including inactive rows.
  } else if (canSeePendingCast) {
    castQuery = castQuery.in("status", ["accepted", "pending"]);
  } else {
    castQuery = castQuery.eq("status", "accepted");
  }

  const { data: castRows, error: castError } = await castQuery;

  if (castError) {
    throw createError({ statusCode: 500, statusMessage: castError.message });
  }

  const castByUserId = new Map(
    (castRows ?? []).map((row) => [row.user_id, row]),
  );

  if (viewerCastRow) {
    castByUserId.set(viewerCastRow.user_id, {
      ...viewerCastRow,
      profiles: null,
    });
  }

  const cast = Array.from(castByUserId.values()).map((row) => {
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

  const viewerCast = viewerCastRow
    ? {
        userId: viewerCastRow.user_id,
        source: viewerCastRow.source,
        status: viewerCastRow.status,
        programOrder: viewerCastRow.program_order,
        note: viewerCastRow.note,
        displayName: null,
        avatarUrl: null,
      }
    : null;

  const producers = (producerRows ?? []).map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return {
      userId: row.user_id,
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
    producers,
    cast,
    viewerCast,
    permissions: { isProducer, canRequestToJoin, canSeePendingCast },
  };
});
