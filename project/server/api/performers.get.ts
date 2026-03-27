import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";
import { filterVisiblePerformerMemberships } from "~~/server/utils/performer-memberships";
import { getServiceRoleClient } from "~~/server/utils/service-role";

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
    const serviceSupabase = getServiceRoleClient();
    const userId = await getOptionalUserId(event, supabase);
    const search = rawSearch.trim();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let allowedUserIds: string[] | null = null;
    if (theaterId) {
      const { data: members, error: membersError } = await serviceSupabase
        .from("theater_memberships")
        .select("user_id")
        .eq("theater_id", theaterId)
        .eq("status", "active");

      if (membersError) {
        throw createError({
          statusCode: 500,
          statusMessage: membersError.message,
        });
      }

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

    let viewerTheaterIds: string[] = [];
    let theaterOnlyVisibleUserIds: string[] = [];

    if (userId) {
      const { data: viewerMemberships, error: viewerMembershipsError } =
        await serviceSupabase
          .from("theater_memberships")
          .select("theater_id")
          .eq("user_id", userId)
          .eq("status", "active");

      if (viewerMembershipsError) {
        throw createError({
          statusCode: 500,
          statusMessage: viewerMembershipsError.message,
        });
      }

      viewerTheaterIds = (viewerMemberships ?? []).map((m) => m.theater_id);

      if (viewerTheaterIds.length > 0) {
        const { data: sharedMemberships, error: sharedMembershipsError } =
          await serviceSupabase
            .from("theater_memberships")
            .select("user_id")
            .in("theater_id", viewerTheaterIds)
            .eq("status", "active");

        if (sharedMembershipsError) {
          throw createError({
            statusCode: 500,
            statusMessage: sharedMembershipsError.message,
          });
        }

        theaterOnlyVisibleUserIds = [
          ...new Set((sharedMemberships ?? []).map((m) => m.user_id)),
        ];
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
    if (userId) {
      const visibilityFilters = ["visibility.eq.public", `id.eq.${userId}`];

      if (theaterOnlyVisibleUserIds.length > 0) {
        visibilityFilters.push(
          `and(visibility.eq.theater_only,id.in.(${theaterOnlyVisibleUserIds.join(",")}))`,
        );
      }

      profileQuery = profileQuery.or(visibilityFilters.join(","));
    } else {
      profileQuery = profileQuery.eq("visibility", "public");
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

    if (!userId) {
      return {
        profiles: sortProfiles(profiles ?? []),
        memberships: [],
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      };
    }

    const profileIds = [...new Set([...(profiles ?? []).map((p) => p.id), userId])];

    const { data: memberships, error: membershipsError } = await serviceSupabase
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

    const visibleMemberships = filterVisiblePerformerMemberships({
      memberships: (memberships ?? []).map((m) => ({
        user_id: m.user_id,
        theater_id: m.theater_id,
        status: "active" as const,
      })),
      viewerUserId: userId,
      sharedTheaterIds: new Set(viewerTheaterIds),
      requestedTheaterId: theaterId,
    });

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
