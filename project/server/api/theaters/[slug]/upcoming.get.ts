import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT,
  DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT,
} from "~~/shared/theater-board-settings";
import {
  buildTheaterEventItems,
  getTheaterEventPeopleByShow,
  getTheaterOccurrenceRows,
  getTheaterShows,
  getVisibleTheaterShowsForRows,
} from "~~/server/utils/theater-events";
import { getServiceRoleClient } from "~~/server/utils/service-role";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });
const UPCOMING_OVERSCAN_MULTIPLIER = 4;
const UPCOMING_MIN_BATCH = 8;

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug,upcoming_shows_limit,upcoming_other_events_limit")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }

  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  let membership = {
    roles: [] as string[],
    status: null as string | null,
  };

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
        roles: membershipRow.roles ?? [],
        status: membershipRow.status,
      };
    }
  }

  const nowIso = new Date().toISOString();
  const showLimit =
    theater.upcoming_shows_limit ?? DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT;
  const otherEventsLimit =
    theater.upcoming_other_events_limit ??
    DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT;
  const visibilityMembership = {
    roles: membership.roles as any,
    status: membership.status as any,
    userId,
  };

  const getUpcomingItemsForType = async ({
    eventType,
    limit,
  }: {
    eventType: "non_show" | "show";
    limit: number;
  }) => {
    if (limit <= 0) {
      return [];
    }

    const shows = await getTheaterShows({
      eventType,
      serviceSupabase,
      theaterId: theater.id,
    });

    if (!shows.length) {
      return [];
    }

    const batchSize = Math.max(
      UPCOMING_MIN_BATCH,
      limit * UPCOMING_OVERSCAN_MULTIPLIER,
    );
    const selectedOccurrences: Awaited<
      ReturnType<typeof getTheaterOccurrenceRows>
    > = [];
    const visibleShowById = new Map<string, (typeof shows)[number]>();
    let offset = 0;

    while (selectedOccurrences.length < limit) {
      const occurrenceBatch = await getTheaterOccurrenceRows({
        fromIso: nowIso,
        limit: batchSize,
        offset,
        serviceSupabase,
        shows,
      });

      if (!occurrenceBatch.length) {
        break;
      }

      const candidateShowIds = new Set(
        occurrenceBatch.map((occurrence) => occurrence.show_id),
      );
      const candidateShows = shows.filter((show) => candidateShowIds.has(show.id));
      const visibleCandidateShows = await getVisibleTheaterShowsForRows({
        membership: visibilityMembership,
        serviceSupabase,
        shows: candidateShows,
      });
      const visibleShowIds = new Set(
        visibleCandidateShows.map((show) => {
          visibleShowById.set(show.id, show);
          return show.id;
        }),
      );

      selectedOccurrences.push(
        ...occurrenceBatch.filter((occurrence) =>
          visibleShowIds.has(occurrence.show_id),
        ),
      );

      if (occurrenceBatch.length < batchSize) {
        break;
      }

      offset += batchSize;
    }

    const occurrences = selectedOccurrences.slice(0, limit);
    const visibleShows = Array.from(
      new Set(occurrences.map((occurrence) => occurrence.show_id)),
    )
      .map((showId) => visibleShowById.get(showId) ?? null)
      .filter((show): show is NonNullable<typeof show> => Boolean(show));

    const peopleByShow = await getTheaterEventPeopleByShow({
      serviceSupabase,
      shows: visibleShows,
    });

    return buildTheaterEventItems({
      occurrences,
      peopleByShow,
      shows: visibleShows,
      theater,
    });
  };

  const [showItems, otherEventItems] = await Promise.all([
    getUpcomingItemsForType({
      eventType: "show",
      limit: showLimit,
    }),
    getUpcomingItemsForType({
      eventType: "non_show",
      limit: otherEventsLimit,
    }),
  ]);

  return {
    otherEvents: otherEventItems,
    shows: showItems,
  };
});
