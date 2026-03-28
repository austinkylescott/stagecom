import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import {
  canRequestToJoinShow,
  canViewAcceptedCast,
  canViewFullCastState,
  canViewPendingCast,
  canViewShow,
  shouldHideResourceExistence,
  type ShowVisibilityViewer,
} from "~~/server/utils/visibility-policy";

const paramsSchema = z.object({ id: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

  const { data: show, error: showError } = await serviceSupabase
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

  let isProducer = false;
  let isTheaterStaff = false;
  let isActiveTheaterMember = false;
  let viewerCastRow: {
    user_id: string;
    source: "invited" | "requested";
    status: "pending" | "accepted" | "declined" | "withdrawn" | "removed";
    program_order: number | null;
    note: string | null;
  } | null = null;

  if (userId) {
    const [
      { data: roleRow, error: roleError },
      { data: membershipRow, error: membershipError },
      { data: castRow, error: castError },
    ] = await Promise.all([
      serviceSupabase
        .from("show_roles")
        .select("role")
        .eq("show_id", showId)
        .eq("user_id", userId)
        .maybeSingle(),
      serviceSupabase
        .from("theater_memberships")
        .select("status,roles")
        .eq("theater_id", show.theater_id)
        .eq("user_id", userId)
        .maybeSingle(),
      serviceSupabase
        .from("show_cast")
        .select("user_id,source,status,program_order,note")
        .eq("show_id", showId)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (roleError) {
      throw createError({ statusCode: 500, statusMessage: roleError.message });
    }
    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }
    if (castError) {
      throw createError({ statusCode: 500, statusMessage: castError.message });
    }

    isProducer = roleRow?.role === "producer";
    isActiveTheaterMember = membershipRow?.status === "active";
    isTheaterStaff =
      isActiveTheaterMember && hasStaffRole(membershipRow.roles);
    viewerCastRow = castRow;
  }

  const viewer: ShowVisibilityViewer = {
    userId,
    isProducer,
    isTheaterStaff,
    isActiveTheaterMember,
    viewerCast: viewerCastRow
      ? {
          source: viewerCastRow.source,
          status: viewerCastRow.status,
        }
      : null,
  };

  if (
    !canViewShow(
      {
        status: show.status,
        isPublicListed: show.is_public_listed,
        castingMode: show.casting_mode,
      },
      viewer,
    )
  ) {
    const hideExistence = shouldHideResourceExistence("show");
    throw createError({
      statusCode: hideExistence ? 404 : 403,
      statusMessage: hideExistence ? "Show not found" : "Not allowed",
    });
  }

  const { data: theater, error: theaterError } = await serviceSupabase
    .from("theaters")
    .select("id,name,slug")
    .eq("id", show.theater_id)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }

  const { data: occurrences, error: occurrencesError } = await serviceSupabase
    .from("show_occurrences")
    .select("id,starts_at,ends_at,status")
    .eq("show_id", showId)
    .order("starts_at", { ascending: true });

  if (occurrencesError) {
    throw createError({
      statusCode: 500,
      statusMessage: occurrencesError.message,
    });
  }

  const { data: producerRows, error: producersError } = await serviceSupabase
    .from("show_roles")
    .select("user_id,profiles(display_name,avatar_url)")
    .eq("show_id", showId)
    .eq("role", "producer");

  if (producersError) {
    throw createError({ statusCode: 500, statusMessage: producersError.message });
  }

  const canSeePendingCast = canViewPendingCast(viewer);
  const canSeeAcceptedCast = canViewAcceptedCast(
    {
      status: show.status,
      isPublicListed: show.is_public_listed,
      castingMode: show.casting_mode,
    },
    viewer,
  );

  let castQuery = serviceSupabase
    .from("show_cast")
    .select(
      "user_id,source,status,program_order,note,profiles(id,display_name,avatar_url)",
    )
    .eq("show_id", showId)
    .order("program_order", { ascending: true, nullsFirst: false });

  if (canViewFullCastState(viewer)) {
    // Producers and theater staff may see the full cast state.
  } else if (canSeePendingCast) {
    castQuery = castQuery.in("status", ["accepted", "pending"]);
  } else if (canSeeAcceptedCast) {
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
    permissions: {
      isProducer,
      canRequestToJoin: canRequestToJoinShow(
        {
          status: show.status,
          isPublicListed: show.is_public_listed,
          castingMode: show.casting_mode,
        },
        viewer,
      ),
      canSeePendingCast,
    },
  };
});
