import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

type ReviewShowRow = {
  id: string;
  title: string;
  status: string;
};

type OccurrenceRow = {
  show_id: string;
  starts_at: string;
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const slug = String(event.context.params?.slug || "");
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing theater slug",
    });
  }

  // 1) Theater lookup
  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  // 2) Check membership is staff/manager
  const { data: membershipRows, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("role,status")
    .eq("theater_id", theater.id)
    .eq("user_id", user.id)
    .eq("status", "active");

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  const isStaff = (membershipRows ?? []).some((m) =>
    ["manager", "staff"].includes(m.role),
  );

  if (!isStaff) {
    throw createError({ statusCode: 403, statusMessage: "Not allowed" });
  }

  // 3) Fetch pending shows
  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("id,title,status")
    .eq("theater_id", theater.id)
    .eq("status", "pending_review");

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const safeShows: ReviewShowRow[] = shows ?? [];
  if (safeShows.length === 0) return { shows: [] };

  // 4) Compute earliest starts_at per show (like SQL min())
  const showIds = safeShows.map((s) => s.id);

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

  return {
    shows: safeShows.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      startsAt: earliestByShow.get(s.id) ?? null,
    })),
  };
});
