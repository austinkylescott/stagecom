import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { canViewNotifications } from "~~/server/utils/visibility-policy";

const bodySchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const { ids, all } = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const userId = await requireUserId(event, supabase);

  if (!canViewNotifications(userId, userId)) {
    throw createError({ statusCode: 403, statusMessage: "Not allowed" });
  }

  if (!ids?.length && !all) {
    throw createError({
      statusCode: 400,
      statusMessage: "Provide ids or all: true",
    });
  }

  let query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (!all && ids?.length) {
    query = query.in("id", ids);
  }

  const { error } = await query;
  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return { ok: true };
});
