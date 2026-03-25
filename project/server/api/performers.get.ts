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
  theaterId: z.string().uuid().optional(),
});

export default defineEventHandler(
  async (event): Promise<PerformersResponse> => {
    const {
      search: rawSearch,
      page,
      pageSize,
      theaterId,
    } = parseQueryParams(event, querySchema);
    const supabase = await serverSupabaseClient(event);
    const userId = await requireUserId(event, supabase);
    const search = rawSearch.trim();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let allowedUserIds: string[] | null = null;
    if (theaterId) {
      const { data: members } = await supabase
        .from("theater_memberships")
        .select("user_id")
        .eq("theater_id", theaterId)
        .eq("status", "active");

      allowedUserIds = (members ?? []).map((m) => m.user_id);

      if (allowedUserIds.length === 0) {
        return {
          profiles: [],
          memberships: [],
          page,
          pageSize,
          total: 0,
          totalPages: 1,
        };
      }
    }

    let profileQuery = supabase
      .from("profiles")
      .select("id,display_name,avatar_url,visibility", { count: "exact" })
      .order("display_name", { ascending: true, nullsFirst: false });

    if (search) {
      profileQuery = profileQuery.ilike("display_name", `%${search}%`);
    }
    if (allowedUserIds) {
      profileQuery = profileQuery.in("id", allowedUserIds);
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
      ...new Set([...(profiles ?? []).map((p) => p.id), userId]),
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

    const visibleMemberships = (memberships ?? []).map((m) => ({
      user_id: m.user_id,
      theater_id: m.theater_id,
      status: "active" as const,
    }));

    return {
      profiles: sortProfiles(profiles ?? []),
      memberships: visibleMemberships,
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    };
  },
);
