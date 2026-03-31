import { serverSupabaseClient } from "#supabase/server";
import type { Enums, Tables } from "~/types/database.types";
import { hasStaffRole } from "~~/server/utils/permissions";

type HomeTheater = Pick<
  Tables<"theaters">,
  "id" | "name" | "slug" | "tagline" | "city" | "state_region" | "country"
>;

type HomeShow = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string | null;
};

type HomePayload = {
  theater: HomeTheater | null;
  shows: HomeShow[];
  candidates?: HomeTheater[];
  membership: {
    status: Enums<"membership_status"> | null;
    roles: Enums<"theater_role">[];
  };
  permissions: {
    isMember: boolean;
    canCreateShow: boolean;
    canReview: boolean;
  };
  stats: {
    pendingReviewCount: number;
    publicShowCount: number;
    upcomingPublicCount: number;
  };
};

export default defineEventHandler(async (event): Promise<HomePayload> => {
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);

  // Determine home theater: prefer profile.home_theater_id. If missing, do NOT auto-pick;
  // instead return candidate theaters so UI can prompt.
  const { data: profile } = await supabase
    .from("profiles")
    .select("home_theater_id")
    .eq("id", userId)
    .maybeSingle();

  const theaterId = profile?.home_theater_id || null;

  // If no home set, return candidate theaters user belongs to so UI can prompt.
  if (!theaterId) {
    const { data: memberships, error: membershipError } = await supabase
      .from("theater_memberships")
      .select("theater_id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }

    const theaterIds = (memberships || []).map(
      (membership) => membership.theater_id,
    );
    if (theaterIds.length === 0) {
      return {
        theater: null,
        shows: [],
        candidates: [],
        membership: { status: null, roles: [] },
        permissions: {
          isMember: false,
          canCreateShow: false,
          canReview: false,
        },
        stats: {
          pendingReviewCount: 0,
          publicShowCount: 0,
          upcomingPublicCount: 0,
        },
      };
    }

    const { data: candidateRows, error: candidatesError } = await supabase
      .from("theaters")
      .select("id,name,slug,tagline,city,state_region,country")
      .in("id", theaterIds);

    if (candidatesError) {
      throw createError({
        statusCode: 500,
        statusMessage: candidatesError.message,
      });
    }

    const candidates = candidateRows || [];

    return {
      theater: null,
      shows: [],
      candidates,
      membership: { status: null, roles: [] },
      permissions: {
        isMember: false,
        canCreateShow: false,
        canReview: false,
      },
      stats: {
        pendingReviewCount: 0,
        publicShowCount: 0,
        upcomingPublicCount: 0,
      },
    };
  }

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug,tagline,city,state_region,country")
    .eq("id", theaterId)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    return {
      theater: null,
      shows: [],
      membership: { status: null, roles: [] },
      permissions: {
        isMember: false,
        canCreateShow: false,
        canReview: false,
      },
      stats: {
        pendingReviewCount: 0,
        publicShowCount: 0,
        upcomingPublicCount: 0,
      },
    };
  }

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

  const membership = {
    status: membershipRow?.status ?? null,
    roles: membershipRow?.roles ?? [],
  };
  const isMember = membership.status === "active";
  const canReview = isMember && hasStaffRole(membership.roles);
  const canCreateShow = isMember;

  // Upcoming shows (next occurrences)
  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("id,title,description")
    .eq("theater_id", theater.id)
    .eq("status", "approved")
    .eq("is_public_listed", true)
    .limit(20);

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const showIds = (shows || []).map((s) => s.id);
  let earliestByShow: Record<string, string | null> = {};

  if (showIds.length) {
    const { data: occ } = await supabase
      .from("show_occurrences")
      .select("show_id,starts_at")
      .in("show_id", showIds)
      .eq("status", "scheduled");

    (occ || []).forEach((o) => {
      const prev = earliestByShow[o.show_id];
      if (!prev || new Date(o.starts_at).getTime() < new Date(prev).getTime()) {
        earliestByShow[o.show_id] = o.starts_at;
      }
    });
  }

  const upcoming: HomeShow[] = (shows || [])
    .map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      startsAt: earliestByShow[s.id] || null,
    }))
    .sort((a, b) => {
      const ta = a.startsAt ? new Date(a.startsAt).getTime() : Infinity;
      const tb = b.startsAt ? new Date(b.startsAt).getTime() : Infinity;
      return ta - tb;
    })
    .slice(0, 4); // preview count

  let pendingReviewCount = 0;

  if (canReview) {
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
    theater,
    shows: upcoming,
    membership,
    permissions: {
      isMember,
      canCreateShow,
      canReview,
    },
    stats: {
      pendingReviewCount,
      publicShowCount: shows?.length ?? 0,
      upcomingPublicCount: upcoming.length,
    },
  };
});
