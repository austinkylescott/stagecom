import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums, Tables } from "~/types/database.types";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import { canViewShow } from "~~/server/utils/visibility-policy";

type TheaterRow = Pick<Tables<"theaters">, "id" | "name" | "slug">;
type MembershipRow = Pick<
  Tables<"theater_memberships">,
  "roles" | "status"
>;
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
type ShowRoleRow = Pick<Tables<"show_roles">, "show_id" | "role">;
type ShowCastRow = Pick<Tables<"show_cast">, "show_id" | "source" | "status">;

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const paramsSchema = z.object({ slug: z.string().trim().min(1) });
const querySchema = z.object({
  month: z.string().regex(monthPattern).optional(),
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
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
};

export default defineEventHandler(async (event) => {
  const { slug } = parseParams(event, paramsSchema);
  const query = parseQueryParams(event, querySchema);
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

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

  let membership: MembershipRow | null = null;

  if (userId) {
    const { data: membershipRow, error: membershipError } = await supabase
      .from("theater_memberships")
      .select("roles,status")
      .eq("theater_id", theater.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }

    membership = membershipRow;
  }

  const { data: shows, error: showError } = await serviceSupabase
    .from("shows")
    .select("id,title,status,theater_id,event_type,casting_mode,is_public_listed")
    .eq("theater_id", theater.id);

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }

  const showRows = (shows as ShowRow[] | null | undefined) ?? [];
  if (!showRows.length) {
    return {
      theater,
      items: [],
      filters: {
        eventTypes: [],
        statuses: [],
      },
    };
  }

  const showIds = showRows.map((show) => show.id);

  let roleRows: ShowRoleRow[] = [];
  let castRows: ShowCastRow[] = [];

  if (userId) {
    const [
      { data: fetchedRoleRows, error: roleError },
      { data: fetchedCastRows, error: castError },
    ] = await Promise.all([
      serviceSupabase
        .from("show_roles")
        .select("show_id,role")
        .in("show_id", showIds)
        .eq("user_id", userId),
      serviceSupabase
        .from("show_cast")
        .select("show_id,source,status")
        .in("show_id", showIds)
        .eq("user_id", userId),
    ]);

    if (roleError) {
      throw createError({ statusCode: 500, statusMessage: roleError.message });
    }

    if (castError) {
      throw createError({ statusCode: 500, statusMessage: castError.message });
    }

    roleRows = (fetchedRoleRows as ShowRoleRow[] | null | undefined) ?? [];
    castRows = (fetchedCastRows as ShowCastRow[] | null | undefined) ?? [];
  }

  const producerShowIds = new Set(
    roleRows.filter((row) => row.role === "producer").map((row) => row.show_id),
  );
  const castByShowId = new Map(castRows.map((row) => [row.show_id, row]));

  const visibleShows = showRows.filter((show) => {
    const viewerCast = castByShowId.get(show.id) ?? null;

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
        isShowStaff: false,
        isActiveTheaterMember: membership?.status === "active",
        viewerCast: viewerCast
          ? {
              source: viewerCast.source,
              status: viewerCast.status,
            }
          : null,
      },
    );
  });

  const filters = {
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
      theater,
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

  const showById = new Map(filteredShows.map((show) => [show.id, show]));
  const scopedOccurrences = (
    (occurrences as OccurrenceRow[] | null | undefined) ?? []
  ).flatMap((occurrence) => {
    const show = showById.get(occurrence.show_id);
    if (!show) {
      return [];
    }

    return [
      {
        occurrenceId: occurrence.id,
        startsAt: occurrence.starts_at,
        endsAt: occurrence.ends_at,
        occurrenceStatus: occurrence.status,
        show: {
          id: show.id,
          title: show.title,
          status: show.status,
          eventType: show.event_type,
          theaterId: theater.id,
          theaterName: theater.name,
          theaterSlug: theater.slug,
        },
      },
    ];
  });

  return {
    theater: theater as TheaterRow,
    items: scopedOccurrences,
    filters,
  };
});
