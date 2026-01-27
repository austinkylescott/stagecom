import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

type TheaterRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string | null;
};

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  const { data: theaters, error: theatersError } = await supabase
    .from("theaters")
    .select("id,name,slug,timezone")
    .order("name");

  if (theatersError) {
    throw createError({ statusCode: 500, statusMessage: theatersError.message });
  }

  let myTheaters: TheaterRow[] = [];

  if (user) {
    const { data: memberships, error: membershipError } = await supabase
      .from("theater_memberships")
      .select("theater_id, role, status, theaters:theater_id (id,name,slug,timezone)")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }

    myTheaters =
      memberships
        ?.map((m: any) => m.theaters)
        .filter(Boolean) ?? [];
  }

  return {
    theaters: (theaters ?? []) as TheaterRow[],
    myTheaters,
  };
});
