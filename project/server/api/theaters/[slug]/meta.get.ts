import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT,
  DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT,
} from "~~/shared/theater-board-settings";
import { canViewTheaterOperations } from "~~/server/utils/visibility-policy";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
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

  return {
    boardSettings: {
      upcomingOtherEventsLimit:
        theater.upcoming_other_events_limit ??
        DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT,
      upcomingShowsLimit:
        theater.upcoming_shows_limit ?? DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT,
    },
    membership,
    permissions: {
      canCreateShow: membership.status === "active",
      canReview: canViewTheaterOperations({
        theaterMembershipStatus: membership.status,
        theaterRoles: membership.roles,
        userId,
      }),
    },
    theater,
  };
});
