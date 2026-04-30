import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";
import { normalizeProfileFieldVisibility } from "~~/shared/profile";
import { filterVisiblePerformerMemberships } from "~~/server/utils/performer-memberships";
import {
  isMissingFieldVisibilityColumnError,
  performerProfileSelectLegacy,
  performerProfileSelectWithFieldVisibility,
} from "~~/server/utils/profile-field-visibility";
import { getServiceRoleClient } from "~~/server/utils/service-role";
import {
  canViewPerformerProfile,
  canViewProfileField,
} from "~~/server/utils/visibility-policy";

type PerformerProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  handle: string | null;
  visibility: Enums<"profile_visibility">;
};

type PerformerProfileRow = PerformerProfile & {
  field_visibility: unknown;
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

const sanitizeProfile = ({
  profile,
  userId,
  sharedTheaterIds,
}: {
  profile: PerformerProfileRow;
  userId: string | null;
  sharedTheaterIds: Set<string>;
}): PerformerProfile => {
  const fieldVisibility = normalizeProfileFieldVisibility(
    profile.field_visibility,
    profile.visibility,
  );
  const displayNameVisible = canViewProfileField({
    viewerUserId: userId,
    performerUserId: profile.id,
    visibility: fieldVisibility.displayName,
    sharedTheaterIds,
  });
  const handleVisible = canViewProfileField({
    viewerUserId: userId,
    performerUserId: profile.id,
    visibility: fieldVisibility.handle,
    sharedTheaterIds,
  });
  const handle = handleVisible ? profile.handle : null;

  return {
    id: profile.id,
    display_name: displayNameVisible
      ? profile.display_name
      : handle
        ? `@${handle}`
        : null,
    avatar_url: profile.avatar_url,
    handle,
    visibility: profile.visibility,
  };
};

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

    const sharedTheaterIds = new Set(viewerTheaterIds);

    let supportsFieldVisibility = true;
    let profileQuery = supabase
      .from("profiles")
      .select(performerProfileSelectWithFieldVisibility, {
        count: "exact",
      })
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

    let {
      data: profiles,
      error: profilesError,
      count,
    } = await profileQuery.range(from, to);

    if (isMissingFieldVisibilityColumnError(profilesError)) {
      supportsFieldVisibility = false;

      let legacyProfileQuery = supabase
        .from("profiles")
        .select(performerProfileSelectLegacy, {
          count: "exact",
        })
        .order("display_name", { ascending: true, nullsFirst: false });

      if (search) {
        legacyProfileQuery = legacyProfileQuery.ilike("display_name", `%${search}%`);
      }
      if (allowedUserIds) {
        legacyProfileQuery = legacyProfileQuery.in("id", allowedUserIds);
      }
      if (userId) {
        const visibilityFilters = ["visibility.eq.public", `id.eq.${userId}`];

        if (theaterOnlyVisibleUserIds.length > 0) {
          visibilityFilters.push(
            `and(visibility.eq.theater_only,id.in.(${theaterOnlyVisibleUserIds.join(",")}))`,
          );
        }

        legacyProfileQuery = legacyProfileQuery.or(visibilityFilters.join(","));
      } else {
        legacyProfileQuery = legacyProfileQuery.eq("visibility", "public");
      }

      ({
        data: profiles,
        error: profilesError,
        count,
      } = await legacyProfileQuery.range(from, to));
    }

    if (profilesError) {
      throw createError({
        statusCode: 500,
        statusMessage: profilesError.message,
      });
    }

    const visibleProfiles = (profiles ?? [])
      .filter((profile) =>
        canViewPerformerProfile({
          viewerUserId: userId,
          performerUserId: profile.id,
          visibility: profile.visibility,
          fieldVisibility: normalizeProfileFieldVisibility(
            supportsFieldVisibility ? profile.field_visibility : null,
            profile.visibility,
          ),
          sharedTheaterIds,
        }),
      )
      .map((profile) =>
        sanitizeProfile({
          profile,
          userId,
          sharedTheaterIds,
        }),
      );

    if (!userId) {
      return {
        profiles: sortProfiles(visibleProfiles),
        memberships: [],
        page,
        pageSize,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      };
    }

    const profileIds = [...new Set([...visibleProfiles.map((p) => p.id), userId])];

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
      sharedTheaterIds,
      requestedTheaterId: theaterId,
    });

    return {
      profiles: sortProfiles(visibleProfiles),
      memberships: visibleMemberships,
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    };
  },
);
