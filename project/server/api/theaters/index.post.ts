import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

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

  // Ensure profile exists (FK requirement)
  await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name:
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        "New user",
    },
    { onConflict: "id" },
  );

  const body = await readBody(event);
  const {
    name,
    slug: incomingSlug,
    tagline = null,
    street = null,
    city = null,
    state_region = null,
    postal_code = null,
    country = null,
  } = body || {};

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "name required",
    });
  }

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
      street,
      city,
      state_region,
      postal_code,
      country,
    })
    .select("id,slug,name,tagline,city,state_region,country")
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
