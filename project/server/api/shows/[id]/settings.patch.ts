import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

const paramsSchema = z.object({ id: z.string().trim().min(1) });
const bodySchema = z.object({
  isCastFinalized: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const { id: showId } = parseParams(event, paramsSchema);
  const body = await parseBody(event, bodySchema);
  const supabase = await serverSupabaseClient(event);
  const actorUserId = await requireUserId(event, supabase);

  if (body.isCastFinalized === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "No settings provided",
    });
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("show_roles")
    .select("role")
    .eq("show_id", showId)
    .eq("user_id", actorUserId)
    .maybeSingle();

  if (roleError) {
    throw createError({ statusCode: 500, statusMessage: roleError.message });
  }

  if (roleRow?.role !== "producer") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only producers can update show settings",
    });
  }

  const { error: updateError } = await supabase
    .from("shows")
    .update({
      is_cast_finalized: body.isCastFinalized,
    })
    .eq("id", showId);

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: updateError.message });
  }

  return {
    isCastFinalized: body.isCastFinalized,
  };
});
