import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Enums, Tables } from "~/types/database.types";

type PublicShowRow = Pick<Tables<"shows">, "id" | "title" | "description">;
type OccurrenceRow = Pick<Tables<"show_occurrences">, "show_id" | "starts_at">;

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const userId =
    user?.id ||
    (await supabase.auth
      .getUser()
      .then((r) => r.data.user?.id)
      .catch(() => null));

  const slug = String(event.context.params?.slug || "");

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing theater slug" });
  }

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select(
      "id,name,slug,tagline,street,city,state_region,postal_code,country",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  // Membership + home state (optional for anonymous users)
  let membership: { status: Enums<"membership_status">; roles: Enums<"theater_role">[] } | null = null;
  let isHome = false;

  if (userId) {
    const { data: membershipRow, error: membershipError } = await supabase
      .from("theater_memberships")
      .select("status,roles")
      .eq("theater_id", theater.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (membershipError) {
      throw createError({ statusCode: 500, statusMessage: membershipError.message });
    }

    if (membershipRow) {
      membership = {
        status: membershipRow.status,
        roles: membershipRow.roles || [],
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("home_theater_id")
      .eq("id", userId)
      .maybeSingle();

    isHome = profile?.home_theater_id === theater.id;
  }

  const staffRoles: Enums<"theater_role">[] = ["admin", "manager", "staff"];
  const isStaff = (membership?.roles || []).some((r) => staffRoles.includes(r));

  // Stats
  const { count: memberCount, error: memberCountError } = await supabase
    .from("theater_memberships")
    .select("theater_id", { count: "exact", head: true })
    .eq("theater_id", theater.id)
    .eq("status", "active");

  if (memberCountError) {
    throw createError({ statusCode: 500, statusMessage: memberCountError.message });
  }

  const { count: totalShows, error: totalShowsError } = await supabase
    .from("shows")
    .select("id", { count: "exact", head: true })
    .eq("theater_id", theater.id);

  if (totalShowsError) {
    throw createError({ statusCode: 500, statusMessage: totalShowsError.message });
  }

  const { count: pendingReviewCount, error: pendingCountError } = await supabase
    .from("shows")
    .select("id", { count: "exact", head: true })
    .eq("theater_id", theater.id)
    .eq("status", "pending_review");

  if (pendingCountError) {
    throw createError({ statusCode: 500, statusMessage: pendingCountError.message });
  }

  // Public shows + earliest occurrences
  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("id,title,description")
    .eq("theater_id", theater.id)
    .eq("status", "approved")
    .eq("is_public_listed", true);

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const publicShows: PublicShowRow[] = shows ?? [];
  let publicShowsWithDates: { id: string; title: string; description: string | null; startsAt: string | null }[] = [];

  if (publicShows.length > 0) {
    const showIds = publicShows.map((s) => s.id);

    const { data: occurrences, error: occError } = await supabase
      .from("show_occurrences")
      .select("show_id,starts_at")
      .in("show_id", showIds)
      .eq("status", "scheduled");

    if (occError) {
      throw createError({ statusCode: 500, statusMessage: occError.message });
    }

    const occRows: OccurrenceRow[] = occurrences ?? [];
    const earliestByShow = new Map<string, string>();

    for (const o of occRows) {
      const prev = earliestByShow.get(o.show_id);
      if (!prev || new Date(o.starts_at).getTime() < new Date(prev).getTime()) {
        earliestByShow.set(o.show_id, o.starts_at);
      }
    }

    publicShowsWithDates = publicShows.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      startsAt: earliestByShow.get(s.id) ?? null,
    }));
  }

  return {
    theater,
    membership: membership ? { ...membership, isHome } : { isHome, roles: [], status: null },
    permissions: { canReview: isStaff },
    stats: {
      memberCount: memberCount ?? 0,
      totalShows: totalShows ?? 0,
      pendingReviewCount: pendingReviewCount ?? 0,
      publicShowCount: publicShows.length,
    },
    shows: {
      public: publicShowsWithDates,
    },
  };
});
