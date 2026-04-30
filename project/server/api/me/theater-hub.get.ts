import { serverSupabaseClient } from "#supabase/server";
import { hasStaffRole } from "~~/server/utils/permissions";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);

  const { data: memberships, error: membershipsError } = await supabase
    .from("theater_memberships")
    .select("theater_id,roles,status,is_home,home_rank")
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipsError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipsError.message,
    });
  }

  const activeMemberships = memberships ?? [];
  if (!activeMemberships.length) {
    return {
      memberships: [],
    };
  }

  const theaterIds = activeMemberships.map((membership) => membership.theater_id);
  const { data: theaterRows, error: theatersError } = await supabase
    .from("theaters")
    .select("id,name,slug,tagline,timezone,city,state_region,country")
    .in("id", theaterIds);

  if (theatersError) {
    throw createError({
      statusCode: 500,
      statusMessage: theatersError.message,
    });
  }

  const theaterById = new Map((theaterRows ?? []).map((theater) => [theater.id, theater]));
  const sortedMemberships = activeMemberships
    .slice()
    .sort((left, right) => {
      if (left.is_home !== right.is_home) {
        return left.is_home ? -1 : 1;
      }

      const leftRank = left.home_rank ?? Number.MAX_SAFE_INTEGER;
      const rightRank = right.home_rank ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      const leftName = theaterById.get(left.theater_id)?.name ?? "";
      const rightName = theaterById.get(right.theater_id)?.name ?? "";
      return leftName.localeCompare(rightName);
    });

  return {
    memberships: sortedMemberships.flatMap((membership) => {
        const theater = theaterById.get(membership.theater_id);
        if (!theater) {
          return [];
        }

        return [
          {
            membership: {
              homeRank: membership.home_rank,
              isHome: membership.is_home,
              roles: membership.roles ?? [],
              status: membership.status,
            },
            permissions: {
              canCreateShow: membership.status === "active",
              canReview: hasStaffRole(membership.roles ?? []),
            },
            theater,
          },
        ];
      }),
  };
});
