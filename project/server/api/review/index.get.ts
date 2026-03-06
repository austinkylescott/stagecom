import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Enums } from "~/types/database.types";

type InboxShow = {
  id: string;
  title: string;
  description: string | null;
  status: Enums<"show_status">;
  eventType: Enums<"event_type"> | null;
  theaterId: string;
  theaterName: string;
  theaterSlug: string;
  nextStartsAt: string | null;
  createdByMe: boolean;
  canReview: boolean;
};

const staffRoles: Enums<"theater_role">[] = ["admin", "manager", "staff"];

const hasStaffRole = (roles: Enums<"theater_role">[] | null | undefined) =>
  (roles || []).some((role) => staffRoles.includes(role));

const getTheater = (value: any) => {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const userId =
    user?.id ||
    (await supabase.auth
      .getUser()
      .then((r) => r.data.user?.id)
      .catch(() => null));

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from("theater_memberships")
    .select("theater_id,roles,status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipsError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipsError.message,
    });
  }

  const reviewTheaterIds = (memberships || [])
    .filter((membership) => hasStaffRole(membership.roles))
    .map((membership) => membership.theater_id);

  const trackedStatuses: Enums<"show_status">[] = [
    "draft",
    "pending_review",
    "approved",
  ];

  const { data: createdShows, error: createdShowsError } = await supabase
    .from("shows")
    .select(
      "id,title,description,status,event_type,theater_id,theaters:theater_id(id,name,slug)",
    )
    .eq("created_by_user_id", userId)
    .in("status", trackedStatuses)
    .order("created_at", { ascending: false });

  if (createdShowsError) {
    throw createError({
      statusCode: 500,
      statusMessage: createdShowsError.message,
    });
  }

  let reviewableShows: any[] = [];
  if (reviewTheaterIds.length > 0) {
    const { data, error } = await supabase
      .from("shows")
      .select(
        "id,title,description,status,event_type,theater_id,theaters:theater_id(id,name,slug)",
      )
      .in("theater_id", reviewTheaterIds)
      .eq("status", "pending_review")
      .order("created_at", { ascending: true });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }

    reviewableShows = data || [];
  }

  const byId = new Map<string, InboxShow>();

  for (const show of createdShows || []) {
    const theater = getTheater((show as any).theaters);
    if (!theater) continue;

    byId.set(show.id, {
      id: show.id,
      title: show.title,
      description: show.description,
      status: show.status,
      eventType: (show as any).event_type,
      theaterId: show.theater_id,
      theaterName: theater.name,
      theaterSlug: theater.slug,
      nextStartsAt: null,
      createdByMe: true,
      canReview: reviewTheaterIds.includes(show.theater_id),
    });
  }

  for (const show of reviewableShows) {
    const theater = getTheater(show.theaters);
    if (!theater) continue;

    const existing = byId.get(show.id);
    if (existing) {
      existing.canReview = true;
      continue;
    }

    byId.set(show.id, {
      id: show.id,
      title: show.title,
      description: show.description,
      status: show.status,
      eventType: show.event_type,
      theaterId: show.theater_id,
      theaterName: theater.name,
      theaterSlug: theater.slug,
      nextStartsAt: null,
      createdByMe: false,
      canReview: true,
    });
  }

  const shows = [...byId.values()];
  if (shows.length === 0) {
    return { shows: [] as InboxShow[] };
  }

  const showIds = shows.map((show) => show.id);
  const { data: occurrences, error: occError } = await supabase
    .from("show_occurrences")
    .select("show_id,starts_at")
    .in("show_id", showIds)
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString());

  if (occError) {
    throw createError({ statusCode: 500, statusMessage: occError.message });
  }

  const earliestByShow = new Map<string, string>();
  for (const occ of occurrences || []) {
    const prev = earliestByShow.get(occ.show_id);
    if (!prev || new Date(occ.starts_at).getTime() < new Date(prev).getTime()) {
      earliestByShow.set(occ.show_id, occ.starts_at);
    }
  }

  for (const show of shows) {
    show.nextStartsAt = earliestByShow.get(show.id) || null;
  }

  shows.sort((a, b) => {
    if (a.canReview !== b.canReview) return a.canReview ? -1 : 1;
    if (a.status !== b.status) {
      if (a.status === "pending_review") return -1;
      if (b.status === "pending_review") return 1;
    }
    const ta = a.nextStartsAt
      ? new Date(a.nextStartsAt).getTime()
      : Number.MAX_SAFE_INTEGER;
    const tb = b.nextStartsAt
      ? new Date(b.nextStartsAt).getTime()
      : Number.MAX_SAFE_INTEGER;
    return ta - tb;
  });

  return { shows };
});
