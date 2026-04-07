import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums, Tables } from "~/types/database.types";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import { canViewShow } from "~~/server/utils/visibility-policy";

type MembershipRow = Pick<
  Tables<"theater_memberships">,
  "theater_id" | "roles" | "status"
>;

type TheaterRow = Pick<Tables<"theaters">, "id" | "name" | "slug">;

type ShowRow = Pick<
  Tables<"shows">,
  | "id"
  | "title"
  | "status"
  | "theater_id"
  | "event_type"
  | "casting_mode"
  | "is_public_listed"
>;

type OccurrenceRow = Pick<
  Tables<"show_occurrences">,
  "id" | "show_id" | "starts_at" | "ends_at" | "status"
>;

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const querySchema = z.object({
  month: z.string().regex(monthPattern).optional(),
  theater: z.string().trim().min(1).optional(),
  type: z
    .enum(["show", "practice", "meeting", "audition", "workshop"])
    .optional(),
  status: z
    .enum(["draft", "pending_review", "approved", "rejected", "cancelled"])
    .optional(),
  timeline: z.enum(["all", "upcoming", "past"]).optional().default("all"),
});

const titleCase = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getMonthBounds = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));

  return {
    start,
    end,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
};

export default defineEventHandler(async (event) => {
  const query = parseQueryParams(event, querySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

  if (!userId) {
    return {
      items: [],
      filters: {
        theaters: [],
        eventTypes: [],
        statuses: [],
      },
    };
  }

  const { data: memberships, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("theater_id,roles,status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  const theaterIds = (memberships ?? []).map((membership) => membership.theater_id);
  const [
    relatedRoleResult,
    relatedCastResult,
    relatedStaffResult,
  ] = await Promise.all([
    serviceSupabase
      .from("show_roles")
      .select("show_id,role")
      .eq("user_id", userId),
    serviceSupabase
      .from("show_cast")
      .select("show_id,source,status")
      .eq("user_id", userId),
    serviceSupabase
      .from("show_staff_assignments")
      .select("show_id")
      .eq("user_id", userId),
  ]);

  if (relatedRoleResult.error || relatedCastResult.error || relatedStaffResult.error) {
    throw createError({
      statusCode: 500,
      statusMessage:
        relatedRoleResult.error?.message ||
        relatedCastResult.error?.message ||
        relatedStaffResult.error?.message ||
        "Failed to load related show relationships",
    });
  }

  const relatedShowIds = [
    ...(relatedRoleResult.data ?? []).map((row) => row.show_id),
    ...(relatedCastResult.data ?? []).map((row) => row.show_id),
    ...(relatedStaffResult.data ?? []).map((row) => row.show_id),
  ];

  if (!theaterIds.length && !relatedShowIds.length) {
    return {
      items: [],
      filters: {
        theaters: [],
        eventTypes: [],
        statuses: [],
      },
    };
  }

  const showQuery = serviceSupabase
    .from("shows")
    .select("id,title,status,theater_id,event_type,casting_mode,is_public_listed");

  if (theaterIds.length > 0 && relatedShowIds.length > 0) {
    showQuery.or(
      `theater_id.in.(${theaterIds.join(",")}),id.in.(${relatedShowIds.join(",")})`,
    );
  } else if (theaterIds.length > 0) {
    showQuery.in("theater_id", theaterIds);
  } else {
    showQuery.in("id", relatedShowIds);
  }

  const { data: shows, error: showError } = await showQuery;

  if (showError) {
    throw createError({
      statusCode: 500,
      statusMessage: showError.message,
    });
  }

  const showIds = (shows ?? []).map((show) => show.id);
  if (!showIds.length) {
    return {
      items: [],
      filters: {
        theaters: [],
        eventTypes: [],
        statuses: [],
      },
    };
  }

  const effectiveTheaterIds = [...new Set((shows ?? []).map((show) => show.theater_id))];

  const { data: theaters, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug")
    .in("id", effectiveTheaterIds);

  if (theaterError) {
    throw createError({
      statusCode: 500,
      statusMessage: theaterError.message,
    });
  }

  const membershipByTheaterId = new Map<string, MembershipRow>(
    (memberships as MembershipRow[] | null | undefined)?.map((membership) => [
      membership.theater_id,
      membership,
    ]) ?? [],
  );
  const theaterById = new Map<string, TheaterRow>(
    (theaters as TheaterRow[] | null | undefined)?.map((theater) => [
      theater.id,
      theater,
    ]) ?? [],
  );
  const producerShowIds = new Set(
    (relatedRoleResult.data ?? [])
      .filter((row) => row.role === "producer")
      .map((row) => row.show_id),
  );
  const castByShowId = new Map(
    (relatedCastResult.data ?? []).map((row) => [row.show_id, row]),
  );
  const showStaffIds = new Set(
    (relatedStaffResult.data ?? []).map((row) => row.show_id),
  );

  const visibleShows = ((shows as ShowRow[] | null | undefined) ?? []).filter(
    (show) => {
      const membership = membershipByTheaterId.get(show.theater_id);
      const viewerCast = castByShowId.get(show.id);

      return canViewShow(
        {
          status: show.status,
          isPublicListed: show.is_public_listed,
          castingMode: show.casting_mode,
        },
        {
          userId,
          isProducer: producerShowIds.has(show.id),
          isTheaterStaff: Boolean(membership && hasStaffRole(membership.roles)),
          isShowStaff: showStaffIds.has(show.id),
          isActiveTheaterMember: membership?.status === "active",
          viewerCast: viewerCast
            ? {
                source: viewerCast.source,
                status: viewerCast.status,
              }
            : null,
        },
      );
    },
  );

  const filters = {
    theaters: Array.from(
      new Map(
        visibleShows
          .map((show) => {
            const theater = theaterById.get(show.theater_id);
            if (!theater) return null;
            return [
              theater.slug,
              {
                label: theater.name,
                value: theater.slug,
              },
            ] as const;
          })
          .filter(Boolean) as Array<
          readonly [string, { label: string; value: string }]
        >,
      ).values(),
    ).sort((a, b) => a.label.localeCompare(b.label)),
    eventTypes: Array.from(
      new Set(
        visibleShows
          .map((show) => show.event_type)
          .filter((value): value is Enums<"event_type"> => Boolean(value)),
      ),
    )
      .sort()
      .map((value) => ({
        label: titleCase(value),
        value,
      })),
    statuses: Array.from(new Set(visibleShows.map((show) => show.status)))
      .sort()
      .map((value) => ({
        label: titleCase(value),
        value,
      })),
  };

  const filteredShows = visibleShows.filter((show) => {
    const theater = theaterById.get(show.theater_id);

    if (query.theater && theater?.slug !== query.theater) {
      return false;
    }

    if (query.type && show.event_type !== query.type) {
      return false;
    }

    if (query.status && show.status !== query.status) {
      return false;
    }

    return true;
  });

  if (!filteredShows.length) {
    return {
      items: [],
      filters,
    };
  }

  const monthBounds = query.month ? getMonthBounds(query.month) : null;
  const nowIso = new Date().toISOString();

  let occurrenceQuery = serviceSupabase
    .from("show_occurrences")
    .select("id,show_id,starts_at,ends_at,status")
    .in(
      "show_id",
      filteredShows.map((show) => show.id),
    )
    .order("starts_at", { ascending: true });

  if (monthBounds) {
    occurrenceQuery = occurrenceQuery
      .gte("starts_at", monthBounds.startIso)
      .lt("starts_at", monthBounds.endIso);
  }

  if (query.timeline === "upcoming") {
    occurrenceQuery = occurrenceQuery.gte("starts_at", nowIso);
  } else if (query.timeline === "past") {
    occurrenceQuery = occurrenceQuery.lt("starts_at", nowIso);
  }

  const { data: occurrences, error: occurrenceError } = await occurrenceQuery;

  if (occurrenceError) {
    throw createError({
      statusCode: 500,
      statusMessage: occurrenceError.message,
    });
  }

  const scopedOccurrences = ((occurrences as OccurrenceRow[] | null | undefined) ?? []).filter(
    (occurrence) => {
      const startsAt = occurrence.starts_at;

      if (monthBounds) {
        if (startsAt < monthBounds.startIso || startsAt >= monthBounds.endIso) {
          return false;
        }
      }

      if (query.timeline === "upcoming" && startsAt < nowIso) {
        return false;
      }

      if (query.timeline === "past" && startsAt >= nowIso) {
        return false;
      }

      return true;
    },
  );

  const showById = new Map(filteredShows.map((show) => [show.id, show]));
  const items = scopedOccurrences
    .map((occurrence) => {
      const show = showById.get(occurrence.show_id);
      if (!show) {
        return null;
      }

      const theater = theaterById.get(show.theater_id);

      return {
        occurrenceId: occurrence.id,
        startsAt: occurrence.starts_at,
        endsAt: occurrence.ends_at,
        occurrenceStatus: occurrence.status,
        show: {
          id: show.id,
          title: show.title,
          status: show.status,
          eventType: show.event_type,
          theaterId: show.theater_id,
          theaterName: theater?.name ?? "Unknown theater",
          theaterSlug: theater?.slug ?? "",
        },
      };
    })
    .filter(Boolean);

  return {
    items,
    filters,
  };
});
