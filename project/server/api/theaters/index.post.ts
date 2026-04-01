import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { isValidTimeZone } from "../../utils/timezone";

/**
 * POST /api/theaters
 * Create a theater and make creator a manager.
 */
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "") // drop leading 'the'
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "theater";

const createTheaterSchema = z.object({
  name: z.string().trim().min(1, "name required"),
  slug: z.string().trim().min(1).max(60).optional(),
  tagline: z.string().trim().min(1).nullable().optional(),
  timezone: z
    .string()
    .trim()
    .min(1, "timezone required")
    .refine((value) => isValidTimeZone(value), "valid IANA timezone required"),
  street: z.string().trim().min(1).nullable().optional(),
  city: z.string().trim().min(1).nullable().optional(),
  state_region: z.string().trim().min(1).nullable().optional(),
  postal_code: z.string().trim().min(1).nullable().optional(),
  country: z.string().trim().min(1).nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const parsedBody = await parseBody(event, createTheaterSchema);
  const supabase = await serverSupabaseClient(event);
  const user = await requireUser(event, supabase);
  const userId = user.id;
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;

  // Ensure profile exists (FK requirement)
  const { error: profileUpsertError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name:
        (typeof metadata.full_name === "string" ? metadata.full_name : null) ||
        (typeof metadata.name === "string" ? metadata.name : null) ||
        user.email ||
        "New user",
    },
    { onConflict: "id" },
  );

  if (profileUpsertError) {
    throw createError({
      statusCode: 500,
      statusMessage: profileUpsertError.message,
    });
  }

  const {
    name,
    slug: incomingSlug,
    tagline = null,
    timezone,
    street = null,
    city = null,
    state_region = null,
    postal_code = null,
    country = null,
  } = parsedBody;

  // Compute slug if missing; ensure uniqueness
  let baseSlug = incomingSlug || slugify(name);
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data: existing, error: existingError } = await supabase
      .from("theaters")
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();

    if (existingError) {
      throw createError({
        statusCode: 500,
        statusMessage: existingError.message,
      });
    }
    if (!existing) break;
    candidate = `${baseSlug}-${suffix++}`;
  }
  const slug = candidate;

  // Create theater
  const { data: inserted, error: insertError } = await supabase
    .from("theaters")
    .insert({
      name,
      slug,
      tagline,
      timezone,
      street,
      city,
      state_region,
      postal_code,
      country,
    })
    .select("id,slug,name,tagline,timezone,city,state_region,country")
    .single();

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message });
  }

  // Creator becomes manager
  const { error: membershipError } = await supabase
    .from("theater_memberships")
    .insert({
      theater_id: inserted.id,
      user_id: userId,
      roles: ["admin"],
      status: "active",
    });

  if (membershipError) {
    throw createError({
      statusCode: 500,
      statusMessage: membershipError.message,
    });
  }

  return inserted;
});
