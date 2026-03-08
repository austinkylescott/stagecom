import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";

const emptyToNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const bodySchema = z.object({
  displayName: z.string().trim().min(1),
  avatarUrl: z.preprocess(emptyToNull, z.string().url().nullable()).optional(),
  timezone: z.string().trim().min(1).optional().default("UTC"),
  pronouns: z.preprocess(emptyToNull, z.string().trim().nullable()).optional(),
  bio: z.preprocess(emptyToNull, z.string().trim().nullable()).optional(),
  city: z.preprocess(emptyToNull, z.string().trim().nullable()).optional(),
  visibility: z
    .enum(["public", "private", "theater_only"])
    .optional()
    .default("theater_only"),
});

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await requireUser(event, supabase);
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const payload = await parseBody(event, bodySchema);

  const displayName =
    payload.displayName ||
    (typeof metadata.full_name === "string" ? metadata.full_name : null) ||
    (typeof metadata.name === "string" ? metadata.name : null) ||
    user.email ||
    "New user";

  const visibility: Enums<"profile_visibility"> = payload.visibility;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        display_name: displayName,
        avatar_url: payload.avatarUrl ?? null,
        timezone: payload.timezone || "UTC",
        pronouns: payload.pronouns ?? null,
        bio: payload.bio ?? null,
        city: payload.city ?? null,
        visibility,
      },
      { onConflict: "id" },
    )
    .select(
      "id, display_name, avatar_url, timezone, pronouns, bio, city, visibility",
    )
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data;
});
