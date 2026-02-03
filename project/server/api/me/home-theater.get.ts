import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

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
      .select(
        "theater_id, theaters:theater_id (id,name,slug,tagline,city,state_region,country)",
      )
      .eq("user_id", userId)
      .eq("status", "active");

    if (membershipError) {
      throw createError({ statusCode: 500, statusMessage: membershipError.message });
    }

    const candidates = (memberships || [])
      .map((m: any) => m.theaters)
      .filter(Boolean);

    return { theater: null, shows: [], candidates };
  }

  const { data: theater, error: theaterError } = await supabase
    .from("theaters")
    .select("id,name,slug,tagline,city,state_region,country")
    .eq("id", theaterId)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) return { theater: null, shows: [] };

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

  const upcoming = (shows || [])
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

  return { theater, shows: upcoming };
});
