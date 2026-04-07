import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import {
  DEFAULT_THEATER_UPCOMING_OTHER_EVENTS_LIMIT,
  DEFAULT_THEATER_UPCOMING_SHOWS_LIMIT,
} from "~~/shared/theater-board-settings";
import { canViewTheaterOperations } from "~~/server/utils/visibility-policy";

const paramsSchema = z.object({ slug: z.string().trim().min(1) });
const THEATER_SELECT_WITH_IDENTITY =
  "id,name,slug,tagline,timezone,upcoming_shows_limit,upcoming_other_events_limit,street,city,state_region,postal_code,country,website_url,logo_url";
const THEATER_SELECT_BASE =
  "id,name,slug,tagline,timezone,upcoming_shows_limit,upcoming_other_events_limit,street,city,state_region,postal_code,country";

const hasMissingIdentityColumnError = (message: string | undefined) =>
  Boolean(
    message &&
      (message.includes("theaters.website_url") ||
        message.includes("theaters.logo_url")),
  );

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const supabase = await serverSupabaseClient(event);
  const userId = await getOptionalUserId(event, supabase);

  let { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select(THEATER_SELECT_WITH_IDENTITY)
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError && hasMissingIdentityColumnError(theaterError.message)) {
    const fallbackResult = await supabase
      .from("theaters")
      .select(THEATER_SELECT_BASE)
      .eq("slug", slug)
      .maybeSingle();

    theaterError = fallbackResult.error;
    theater = fallbackResult.data
      ? {
          ...fallbackResult.data,
          logo_url: null,
          website_url: null,
        }
      : null;
  }

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
