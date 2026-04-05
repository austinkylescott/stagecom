import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  buildTheaterEventItems,
  getTheaterEventPeopleByShow,
  getTheaterOccurrenceRows,
  getVisibleTheaterShows,
} from "~~/server/utils/theater-events";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await requireUserId(event, supabase);

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }

  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  const { data: membershipRow, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("status,roles")
    .eq("theater_id", theater.id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  if (!membershipRow) {
    throw createError({ statusCode: 403, statusMessage: "Membership required" });
  }

  const membership = {
    roles: membershipRow.roles ?? [],
    status: membershipRow.status,
    userId,
  };

  const visibleShows = await getVisibleTheaterShows({
    membership: {
      roles: membership.roles as any,
      status: membership.status as any,
      userId: membership.userId,
    },
    serviceSupabase,
    theaterId: theater.id,
  });

  const now = new Date();
  const nowIso = now.toISOString();
  const inThirtyDaysIso = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const showRows = visibleShows.filter((show) => show.event_type === "show");
  const otherEventRows = visibleShows.filter((show) => show.event_type !== "show");

  const [nextShowOccurrences, nextOtherOccurrences, nextThirtyDaysOccurrences] =
    await Promise.all([
      getTheaterOccurrenceRows({
        fromIso: nowIso,
        limit: 1,
        serviceSupabase,
        shows: showRows,
      }),
      getTheaterOccurrenceRows({
        fromIso: nowIso,
        limit: 1,
        serviceSupabase,
        shows: otherEventRows,
      }),
      getTheaterOccurrenceRows({
        fromIso: nowIso,
        serviceSupabase,
        shows: visibleShows,
        toIso: inThirtyDaysIso,
      }),
    ]);

  const dashboardShows = visibleShows.filter((show) =>
    [nextShowOccurrences[0]?.show_id, nextOtherOccurrences[0]?.show_id].includes(show.id),
  );
  const peopleByShow = await getTheaterEventPeopleByShow({
    serviceSupabase,
    shows: dashboardShows,
  });

  const [upNextShow] = buildTheaterEventItems({
    occurrences: nextShowOccurrences,
    peopleByShow,
    shows: showRows,
    theater,
  });
  const [upNextOtherEvent] = buildTheaterEventItems({
    occurrences: nextOtherOccurrences,
    peopleByShow,
    shows: otherEventRows,
    theater,
  });

  let pendingReviewCount = 0;
  if (hasStaffRole(membership.roles as any)) {
    const { count, error: pendingError } = await supabase
      .from("shows")
      .select("id", { count: "exact", head: true })
      .eq("theater_id", theater.id)
      .eq("status", "pending_review");

    if (pendingError) {
      throw createError({
        statusCode: 500,
        statusMessage: pendingError.message,
      });
    }

    pendingReviewCount = count ?? 0;
  }

  return {
    dashboard: {
      nextThirtyDaysCount: nextThirtyDaysOccurrences.length,
      pendingReviewCount,
      upNextOtherEvent: upNextOtherEvent ?? null,
      upNextShow: upNextShow ?? null,
    },
  };
});
