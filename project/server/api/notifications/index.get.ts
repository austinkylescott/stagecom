import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

const MY_SHOWS_TYPES = [
  "show.approved",
  "show.rejected",
  "cast.requested",
  "cast.accepted",
  "cast.declined",
  "cast.withdrawn",
  "cast.removed_by_producer",
];

const OTHER_TYPES = [
  "cast.invited",
  "cast.request_approved",
  "occurrence.time_changed",
  "occurrence.cancelled",
  "occurrence.reminder_24h",
];

const querySchema = z.object({
  filter: z.enum(["all", "my_shows", "other"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(30),
});

export default defineEventHandler(async (event) => {
  const { filter, page, pageSize } = parseQueryParams(event, querySchema);
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("notifications")
    .select(
      "id,type,entity_type,entity_id,payload,dedupe_key,read_at,created_at",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter === "my_shows") {
    query = query.in("type", MY_SHOWS_TYPES);
  } else if (filter === "other") {
    query = query.in("type", OTHER_TYPES);
  }

  const { data, error, count } = await query;

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return {
    notifications: data ?? [],
    total: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    page,
    pageSize,
  };
});
