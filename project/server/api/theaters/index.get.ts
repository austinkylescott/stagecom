import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Tables } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  const userId =
    user?.id ||
    (await supabase.auth
      .getUser()
      .then((r) => r.data.user?.id)
      .catch(() => null));

  const query = getQuery(event);
  const search = (query.search as string | undefined) || "";
  const sort = (query.sort as string | undefined) || "name_asc";
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 20);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let supa = supabase
    .from("theaters")
    .select("id,name,slug,tagline,city,state_region,country", {
      count: "exact",
    });

  if (search) {
    supa = supa.ilike("name", `%${search}%`);
  }

  if (sort === "recent") {
    supa = supa.order("created_at", { ascending: false });
  } else if (sort === "next_show") {
    // placeholder; fallback to name for now
    supa = supa.order("name");
  } else {
    supa = supa.order("name");
  }

  const {
    data: theaters,
    error: theatersError,
    count,
  } = await supa.range(from, to);

  if (theatersError) {
    throw createError({
      statusCode: 500,
      statusMessage: theatersError.message,
    });
  }

  type TheaterRow = Pick<
    Tables<"theaters">,
    "id" | "name" | "slug" | "tagline" | "city" | "state_region" | "country"
  >;
  let myTheaters: TheaterRow[] = [];
  let membershipSet = new Set<string>();

  if (userId) {
    const { data: memberships, error: membershipError } = await supabase
      .from("theater_memberships")
      .select(
        "theater_id, roles, status, theaters:theater_id (id,name,slug,tagline,city,state_region,country)",
      )
      .eq("user_id", userId)
      .eq("status", "active");

    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }

    myTheaters = memberships?.map((m: any) => m.theaters).filter(Boolean) ?? [];
    membershipSet = new Set(memberships?.map((m: any) => m.theater_id) ?? []);
  }

  return {
    theaters: (theaters ?? []).map((t: any) => ({
      ...t,
      isMember: membershipSet.has(t.id),
    })) as (TheaterRow & { isMember?: boolean })[],
    myTheaters,
    totalPages: count ? Math.ceil(count / pageSize) : undefined,
  };
});
