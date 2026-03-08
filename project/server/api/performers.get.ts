import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";

type PerformerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  visibility: Enums<"profile_visibility">;
};

type PerformerMembership = {
  user_id: string;
  theater_id: string;
  status: "active";
};

type PerformersResponse = {
  profiles: PerformerProfile[];
  memberships: PerformerMembership[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
};

const sortProfiles = (profiles: PerformerProfile[]) =>
  [...profiles].sort((a, b) => {
    const aName = (a.display_name || "").trim().toLowerCase();
    const bName = (b.display_name || "").trim().toLowerCase();
    if (!aName && !bName) return a.id.localeCompare(b.id);
    if (!aName) return 1;
    if (!bName) return -1;
    return aName.localeCompare(bName);
  });

const querySchema = z.object({
  search: z.string().optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(24),
});

export default defineEventHandler(
  async (event): Promise<PerformersResponse> => {
    const supabase = await serverSupabaseClient(event);
    const userId = await requireUserId(event, supabase);
    const parsedQuery = querySchema.safeParse(getQuery(event));
    if (!parsedQuery.success) {
      throw createError({ statusCode: 400, statusMessage: "Invalid query" });
    }
    const { search: rawSearch, page, pageSize } = parsedQuery.data;
    const search = rawSearch.trim();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let profileQuery = supabase
      .from("profiles")
      .select("id,display_name,avatar_url,visibility", { count: "exact" })
      .order("display_name", { ascending: true, nullsFirst: false });

    if (search) {
      profileQuery = profileQuery.ilike("display_name", `%${search}%`);
    }

    const {
      data: profiles,
      error: profilesError,
      count,
    } = await profileQuery.range(from, to);

    if (profilesError) {
      throw createError({
        statusCode: 500,
        statusMessage: profilesError.message,
      });
    }

    const profileIds = [
      ...new Set([...(profiles || []).map((p) => p.id), userId]),
    ];
    const { data: memberships, error: membershipsError } = await supabase
      .from("theater_memberships")
      .select("user_id,theater_id,status")
      .in("user_id", profileIds)
      .eq("status", "active");

    if (membershipsError) {
      throw createError({
        statusCode: 500,
        statusMessage: membershipsError.message,
      });
    }

    const visibleMemberships = (memberships || []).map((membership) => ({
      user_id: membership.user_id,
      theater_id: membership.theater_id,
      status: "active" as const,
    }));

    return {
      profiles: sortProfiles(profiles || []),
      memberships: visibleMemberships,
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
    };
  },
);
