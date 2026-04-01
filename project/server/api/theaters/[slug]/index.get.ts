import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums, Tables } from "~/types/database.types";
import { canViewTheaterOperations } from "~~/server/utils/visibility-policy";
import { getServiceRoleClient } from "~~/server/utils/service-role";

type PublicShowRow = Pick<
  Tables<"shows">,
  "id" | "title" | "description" | "event_type" | "ticket_url"
>;
type OccurrenceRow = Pick<
  Tables<"show_occurrences">,
  "show_id" | "starts_at" | "status"
>;
type ProducerRow = {
  show_id: string;
  user_id: string;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};
type CastPreviewRow = {
  show_id: string;
  user_id: string;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};
const paramsSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug,tagline,timezone,street,city,state_region,postal_code,country")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  // Membership + home state (optional for anonymous users)
  let membership: {
    status: Enums<"membership_status">;
    roles: Enums<"theater_role">[];
  } | null = null;
  let isHome = false;

  if (userId) {
    const { data: membershipRow, error: membershipError } = await supabase
      .from("theater_memberships")
      .select("status,roles")
      .eq("theater_id", theater.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }

    if (membershipRow) {
      membership = {
        status: membershipRow.status,
        roles: membershipRow.roles || [],
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("home_theater_id")
      .eq("id", userId)
      .maybeSingle();

    isHome = profile?.home_theater_id === theater.id;
  }

  const canViewOperations = canViewTheaterOperations({
    userId,
    theaterMembershipStatus: membership?.status ?? null,
    theaterRoles: membership?.roles ?? [],
  });

  // Stats
  const { count: memberCount, error: memberCountError } = await supabase
    .from("theater_memberships")
    .select("theater_id", { count: "exact", head: true })
    .eq("theater_id", theater.id)
    .eq("status", "active");

  if (memberCountError) {
    throw createError({
      statusCode: 500,
      statusMessage: memberCountError.message,
    });
  }

  let totalShows = 0;
  let pendingReviewCount = 0;

  if (canViewOperations) {
    const [
      { count: totalShowsCount, error: totalShowsError },
      { count: pendingCount, error: pendingCountError },
    ] = await Promise.all([
      supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .eq("theater_id", theater.id),
      supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .eq("theater_id", theater.id)
        .eq("status", "pending_review"),
    ]);

    if (totalShowsError) {
      throw createError({
        statusCode: 500,
        statusMessage: totalShowsError.message,
      });
    }
    if (pendingCountError) {
      throw createError({
        statusCode: 500,
        statusMessage: pendingCountError.message,
      });
    }

    totalShows = totalShowsCount ?? 0;
    pendingReviewCount = pendingCount ?? 0;
  }

  // Public shows + earliest occurrences
  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("id,title,description,event_type,ticket_url")
    .eq("theater_id", theater.id)
    .eq("status", "approved")
    .eq("is_public_listed", true);

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const publicShows: PublicShowRow[] = shows ?? [];
  let publicShowsWithDates: {
    id: string;
    title: string;
    description: string | null;
    eventType: Enums<"event_type"> | null;
    startsAt: string | null;
    ticketUrl: string | null;
    producers: {
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
    }[];
    cast: {
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
    }[];
  }[] = [];
  let upcomingPublicOccurrenceCount = 0;

  if (publicShows.length > 0) {
    const showIds = publicShows.map((s) => s.id);
    const nowIso = new Date().toISOString();

    const { data: occurrences, error: occError } = await supabase
      .from("show_occurrences")
      .select("show_id,starts_at,status")
      .in("show_id", showIds)
      .eq("status", "scheduled");

    if (occError) {
      throw createError({ statusCode: 500, statusMessage: occError.message });
    }

    const occRows: OccurrenceRow[] = occurrences ?? [];
    const [
      { data: producerRows, error: producerError },
      { data: castRows, error: castError },
    ] = await Promise.all([
      serviceSupabase
        .from("show_roles")
        .select("show_id,user_id,profiles(display_name,avatar_url)")
        .in("show_id", showIds)
        .eq("role", "producer"),
      serviceSupabase
        .from("show_cast")
        .select("show_id,user_id,profiles(display_name,avatar_url)")
        .in("show_id", showIds)
        .eq("status", "accepted")
        .order("program_order", { ascending: true, nullsFirst: false }),
    ]);

    if (producerError) {
      throw createError({
        statusCode: 500,
        statusMessage: producerError.message,
      });
    }

    if (castError) {
      throw createError({
        statusCode: 500,
        statusMessage: castError.message,
      });
    }

    const nextUpcomingByShow = new Map<string, string>();
    const producersByShow = new Map<
      string,
      {
        userId: string;
        displayName: string | null;
        avatarUrl: string | null;
      }[]
    >();
    const castByShow = new Map<
      string,
      {
        userId: string;
        displayName: string | null;
        avatarUrl: string | null;
      }[]
    >();

    for (const o of occRows) {
      if (o.starts_at >= nowIso) {
        upcomingPublicOccurrenceCount += 1;
      }

      if (o.starts_at < nowIso) {
        continue;
      }

      const prev = nextUpcomingByShow.get(o.show_id);
      if (!prev || new Date(o.starts_at).getTime() < new Date(prev).getTime()) {
        nextUpcomingByShow.set(o.show_id, o.starts_at);
      }
    }

    for (const row of (producerRows as ProducerRow[] | null | undefined) ?? []) {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const items = producersByShow.get(row.show_id) ?? [];
      items.push({
        userId: row.user_id,
        displayName: profile?.display_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      });
      producersByShow.set(row.show_id, items);
    }

    for (const row of (castRows as CastPreviewRow[] | null | undefined) ?? []) {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const items = castByShow.get(row.show_id) ?? [];
      items.push({
        userId: row.user_id,
        displayName: profile?.display_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      });
      castByShow.set(row.show_id, items);
    }

    publicShowsWithDates = publicShows
      .map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        eventType: s.event_type,
        startsAt: nextUpcomingByShow.get(s.id) ?? null,
        ticketUrl: s.ticket_url,
        producers: producersByShow.get(s.id) ?? [],
        cast: (castByShow.get(s.id) ?? []).slice(0, 5),
      }))
      .filter((show) => Boolean(show.startsAt))
      .sort(
        (left, right) =>
          new Date(left.startsAt ?? "").getTime() -
          new Date(right.startsAt ?? "").getTime(),
      );
  }

  return {
    theater,
    membership: membership
      ? { ...membership, isHome }
      : { isHome, roles: [], status: null },
    permissions: { canReview: canViewOperations },
    stats: {
      memberCount: memberCount ?? 0,
      totalShows: canViewOperations ? totalShows : publicShows.length,
      pendingReviewCount,
      publicShowCount: publicShows.length,
      upcomingPublicOccurrenceCount,
    },
    shows: {
      public: publicShowsWithDates,
    },
  };
});
