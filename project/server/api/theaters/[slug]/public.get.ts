import { serverSupabaseClient } from "#supabase/server";
import type { Tables } from "~/types/database.types";

type PublicShowRow = Pick<Tables<"shows">, "id" | "title" | "description">;
type OccurrenceRow = Pick<
  Tables<"show_occurrences">,
  "show_id" | "starts_at" | "status"
>;

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
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
    .select("id,name,tagline,street,city,state_region,postal_code,country")
    .eq("slug", slug)
    .maybeSingle();

  if (theaterError) {
    throw createError({ statusCode: 500, statusMessage: theaterError.message });
  }
  if (!theater) {
    throw createError({ statusCode: 404, statusMessage: "Theater not found" });
  }

  // 2) Fetch shows that are approved + publicly listed
  const { data: shows, error: showsError } = await supabase
    .from("shows")
    .select("id,title,description")
    .eq("theater_id", theater.id)
    .eq("status", "approved")
    .eq("is_public_listed", true);

  if (showsError) {
    throw createError({ statusCode: 500, statusMessage: showsError.message });
  }

  const safeShows: PublicShowRow[] = shows ?? [];
  if (safeShows.length === 0) {
    return { theater, shows: [] };
  }

  // 3) Fetch occurrences for these shows
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

  // 4) Compute earliest starts_at per show (like your SQL min())
  const earliestByShow = new Map<string, string>();

  for (const o of occRows) {
    const prev = earliestByShow.get(o.show_id);
    if (!prev || new Date(o.starts_at).getTime() < new Date(prev).getTime()) {
      earliestByShow.set(o.show_id, o.starts_at);
    }
  }

  const result = safeShows.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    startsAt: earliestByShow.get(s.id) ?? null,
  }));

  return { theater, shows: result };
});
