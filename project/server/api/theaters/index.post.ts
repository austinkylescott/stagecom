import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import { isValidTimeZone } from "../../utils/timezone";

/**
 * POST /api/theaters
 * Create a theater and make creator an admin.
 */
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "") // drop leading 'the'
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "theater";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const createTheaterSchema = z.object({
  name: z.string().trim().min(1, "name required"),
  slug: z.string().trim().min(1).max(60).optional(),
  tagline: z.string().trim().min(1, "tagline required"),
  timezone: z
    .string()
    .trim()
    .min(1, "timezone required")
    .refine((value) => isValidTimeZone(value), "valid IANA timezone required"),
  street: z.string().trim().min(1, "street required"),
  city: z.string().trim().min(1, "city required"),
  state_region: z.string().trim().min(1, "state/region required"),
  postal_code: z.string().trim().min(1, "postal code required"),
  country: z.string().trim().min(1, "country required"),
  website_url: z.preprocess(
    emptyToNull,
    z.string().trim().url("valid website URL required").nullable(),
  ).optional(),
  logo_url: z.preprocess(
    emptyToNull,
    z.string().trim().url("valid logo URL required").nullable(),
  ).optional(),
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
    tagline,
    timezone,
    street,
    city,
    state_region,
    postal_code,
    country,
    website_url = null,
    logo_url = null,
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
      website_url,
      logo_url,
    })
    .select("id,slug")
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
