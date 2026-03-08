import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Tables } from "~/types/database.types";

const querySchema = z.object({
  search: z.string().optional().default(""),
  sort: z.enum(["name_asc", "recent"]).optional().default("name_asc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export default defineEventHandler(async (event) => {
  const { search, sort, page, pageSize } = parseQueryParams(event, querySchema);
  const supabase = await serverSupabaseClient(event);
  const userId = await getOptionalUserId(event, supabase);

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
      .select("theater_id")
      .eq("user_id", userId)
      .eq("status", "active");

    if (membershipError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipError.message,
      });
    }

    const membershipTheaterIds = (memberships || []).map((m) => m.theater_id);
    membershipSet = new Set(membershipTheaterIds);

    if (membershipTheaterIds.length > 0) {
      const { data: myTheaterRows, error: myTheatersError } = await supabase
        .from("theaters")
        .select("id,name,slug,tagline,city,state_region,country")
        .in("id", membershipTheaterIds)
        .order("name");

      if (myTheatersError) {
        throw createError({
          statusCode: 500,
          statusMessage: myTheatersError.message,
        });
      }

      myTheaters = myTheaterRows || [];
    }
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
