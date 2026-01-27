import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

type ShowRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  theater_id: string;
};

type OccRow = {
  show_id: string;
  starts_at: string;
  status: string;
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    return { shows: [] };
  }

  // Theaters where user is active member
  const { data: memberships, error: membershipError } = await supabase
    .from("theater_memberships")
    .select("theater_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  const theaterIds = (memberships ?? []).map((m) => m.theater_id);
  if (theaterIds.length === 0) return { shows: [] };

  const { data: theaters, error: theatersError } = await supabase
    .from("theaters")
    .select("id,name,slug")
    .in("id", theaterIds);

  if (theatersError) {
    throw createError({ statusCode: 500, statusMessage: theatersError.message });
  }

  // Shows for those theaters
  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("id,title,description,status,theater_id")
    .in("theater_id", theaterIds);

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const showIds = (shows ?? []).map((s) => s.id);
  if (showIds.length === 0) return { shows: [] };

  // Upcoming occurrences
  const { data: occs, error: occError } = await supabase
    .from("show_occurrences")
    .select("show_id,starts_at,status")
    .in("show_id", showIds)
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

  const result = (shows ?? []).map((s) => {
    const theater = theaterById.get(s.theater_id);
    return {
      id: s.id,
      title: s.title,
      description: s.description,
      status: s.status,
      theaterId: s.theater_id,
      theaterName: theater?.name ?? "Unknown theater",
      theaterSlug: theater?.slug ?? "",
      nextStartsAt: earliestByShow.get(s.id) ?? null,
    };
  });

  return { shows: result };
});
