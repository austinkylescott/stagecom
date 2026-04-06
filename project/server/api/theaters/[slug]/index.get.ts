import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT,
  DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT,
} from "~~/shared/theater-board-settings";
import { canViewTheaterOperations } from "~~/server/utils/visibility-policy";
import {
  buildTheaterEventItems,
  getTheaterEventPeopleByShow,
  getTheaterOccurrenceRows,
  getVisibleTheaterShows,
} from "~~/server/utils/theater-events";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select(
      "id,name,slug,tagline,timezone,upcoming_shows_limit,upcoming_other_events_limit,street,city,state_region,postal_code,country,website_url,logo_url",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }

  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  let membership = {
    isHome: false,
    roles: [] as string[],
    status: null as string | null,
  };

  if (userId) {
    const { data: membershipRow, error: membershipError } = await supabase
      .from("theater_memberships")
      .select("status,roles,is_home")
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
        isHome: membershipRow.is_home,
        roles: membershipRow.roles ?? [],
        status: membershipRow.status,
      };
    }
  }

  const canViewOperations = canViewTheaterOperations({
    theaterMembershipStatus: membership.status,
    theaterRoles: membership.roles,
    userId,
  });

  const now = new Date();
  const nowIso = now.toISOString();
  const inThirtyDaysIso = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const visibleShows = await getVisibleTheaterShows({
    membership: {
      roles: membership.roles as any,
      status: membership.status as any,
      userId,
    },
    serviceSupabase: serviceSupabase,
    theaterId: theater.id,
  });

  const theaterSummary = {
    id: theater.id,
    name: theater.name,
    slug: theater.slug,
  };

  const [visibleUpcomingOccurrences, peopleByShow] = await Promise.all([
    getTheaterOccurrenceRows({
      fromIso: nowIso,
      serviceSupabase,
      shows: visibleShows,
    }),
    getTheaterEventPeopleByShow({
      serviceSupabase,
      shows: visibleShows,
    }),
  ]);

  const visibleUpcomingItems = buildTheaterEventItems({
    occurrences: visibleUpcomingOccurrences,
    peopleByShow,
    shows: visibleShows,
    theater: theaterSummary,
  });
  const nextThirtyDaysItems = visibleUpcomingItems.filter(
    (item) => item.startsAt < inThirtyDaysIso,
  );
  const upcomingShowItems = visibleUpcomingItems
    .filter((item) => item.show.eventType === "show")
    .slice(0, 3);

  const [
    { count: memberCount, error: memberCountError },
    { count: publicShowCount, error: publicShowsError },
  ] = await Promise.all([
    supabase
      .from("theater_memberships")
      .select("theater_id", { count: "exact", head: true })
      .eq("theater_id", theater.id)
      .eq("status", "active"),
    supabase
      .from("shows")
      .select("id", { count: "exact", head: true })
      .eq("theater_id", theater.id)
      .eq("status", "approved")
      .eq("is_public_listed", true),
  ]);

  if (memberCountError) {
    throw createError({
      statusCode: 500,
      statusMessage: memberCountError.message,
    });
  }

  if (publicShowsError) {
    throw createError({
      statusCode: 500,
      statusMessage: publicShowsError.message,
    });
  }

  let totalShows = publicShowCount ?? 0;
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

    totalShows = totalShowsCount ?? totalShows;
    pendingReviewCount = pendingCount ?? 0;
  }

  return {
    boardSettings: {
      upcomingOtherEventsLimit:
        theater.upcoming_other_events_limit ??
        DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT,
      upcomingShowsLimit:
        theater.upcoming_shows_limit ?? DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT,
    },
    dashboard: {
      upNextOtherEvent:
        visibleUpcomingItems.find((item) => item.show.eventType !== "show") ?? null,
      upNextShow:
        visibleUpcomingItems.find((item) => item.show.eventType === "show") ?? null,
    },
    membership,
    permissions: {
      canCreateShow: membership.status === "active",
      canReview: canViewOperations,
    },
    programming: {
      nextThirtyDays: nextThirtyDaysItems,
      upcomingShows: upcomingShowItems,
    },
    stats: {
      memberCount: memberCount ?? 0,
      pendingReviewCount,
      publicShowCount: publicShowCount ?? 0,
      totalShows,
      upcomingPublicOccurrenceCount: nextThirtyDaysItems.filter(
        (item) =>
          item.show.status === "approved" && item.startsAt < inThirtyDaysIso,
      ).length,
      visibleNextThirtyDaysCount: nextThirtyDaysItems.length,
    },
    theater,
  };
});
