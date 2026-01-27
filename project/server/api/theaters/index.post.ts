import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

/**
 * POST /api/theaters
 * Create a theater and make creator a manager.
 */
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const body = await readBody(event);
  const { name, slug, timezone } = body || {};

  if (!name || !slug || !timezone) {
    throw createError({
      statusCode: 400,
      statusMessage: "name, slug, timezone required",
    });
  }

  // Ensure slug uniqueness
  const { data: existing, error: existingError } = await supabase
    .from("theaters")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) {
    throw createError({
      statusCode: 500,
      statusMessage: existingError.message,
    });
  }
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug already in use",
    });
  }

  // Create theater
  const { data: inserted, error: insertError } = await supabase
    .from("theaters")
    .insert({ name, slug, timezone })
    .select("id,slug,name,timezone")
    .single();

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message });
  }

  // Creator becomes manager
  const { error: membershipError } = await supabase
    .from("theater_memberships")
    .insert({
      theater_id: inserted.id,
      user_id: user.id,
      role: "manager",
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
