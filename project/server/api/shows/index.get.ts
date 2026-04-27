import { serverSupabaseClient } from "#supabase/server";
import type { Enums, Tables } from "~/types/database.types";
import { hasStaffRole } from "~~/server/utils/permissions";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import { canViewShow } from "~~/server/utils/visibility-policy";

type ShowRow = Pick<
  Tables<"shows">,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "status"
  | "theater_id"
  | "event_type"
  | "casting_mode"
  | "is_public_listed"
>;

type OccRow = Pick<
  Tables<"show_occurrences">,
  "show_id" | "starts_at" | "status"
>;

type ShowItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: Enums<"show_status">;
  eventType: Enums<"event_type"> | null;
  theaterId: string;
  theaterName: string;
  theaterSlug: string;
  nextStartsAt: string | null;
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const serviceSupabase = getServiceRoleClient();
  const userId = await getOptionalUserId(event, supabase);

  if (!userId) {
    return { shows: [] };
  }

  // Theaters where user is active member
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

  const theaterIds = (memberships ?? []).map((m) => m.theater_id);
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

  if (theaterIds.length === 0 && relatedShowIds.length === 0) return { shows: [] };

  const showQuery = serviceSupabase
    .from("shows")
    .select("id,slug,title,description,status,theater_id,event_type,casting_mode,is_public_listed");

  if (theaterIds.length > 0 && relatedShowIds.length > 0) {
    showQuery.or(
      `theater_id.in.(${theaterIds.join(",")}),id.in.(${relatedShowIds.join(",")})`,
    );
  } else if (theaterIds.length > 0) {
    showQuery.in("theater_id", theaterIds);
  } else {
    showQuery.in("id", relatedShowIds);
  }

  const { data: shows, error: showsError } = await showQuery;

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const showIds = (shows ?? []).map((s) => s.id);
  if (showIds.length === 0) return { shows: [] };

  const effectiveTheaterIds = [...new Set((shows ?? []).map((show) => show.theater_id))];

  const { data: theaters, error: theatersError } = await supabase
    .from("theaters")
    .select("id,name,slug")
    .in("id", effectiveTheaterIds);

  if (theatersError) {
    throw createError({
      statusCode: 500,
      statusMessage: theatersError.message,
    });
  }

  const activeMembershipByTheaterId = new Map(
    (memberships ?? []).map((membership) => [membership.theater_id, membership]),
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

  const visibleShows = (shows ?? []).filter((show) => {
    const membership = activeMembershipByTheaterId.get(show.theater_id);
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
  });

  if (visibleShows.length === 0) return { shows: [] };

  // Upcoming occurrences
  const { data: occs, error: occError } = await serviceSupabase
    .from("show_occurrences")
    .select("show_id,starts_at,status")
    .in(
      "show_id",
      visibleShows.map((show) => show.id),
    )
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString());

  if (occError) {
    throw createError({ statusCode: 500, statusMessage: occError.message });
  }

  const earliestByShow = new Map<string, string>();
  for (const o of occs ?? []) {
    const prev = earliestByShow.get(o.show_id);
    if (!prev || new Date(o.starts_at).getTime() < new Date(prev).getTime()) {
      earliestByShow.set(o.show_id, o.starts_at);
    }
  }

  const theaterById = new Map(
    (theaters ?? []).map((t) => [t.id, { name: t.name, slug: t.slug }]),
  );

  const result: ShowItem[] = visibleShows.map((s) => {
    const theater = theaterById.get(s.theater_id);
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      status: s.status,
      eventType: s.event_type,
      theaterId: s.theater_id,
      theaterName: theater?.name ?? "Unknown theater",
      theaterSlug: theater?.slug ?? "",
      nextStartsAt: earliestByShow.get(s.id) ?? null,
    };
  });

  return { shows: result };
});
