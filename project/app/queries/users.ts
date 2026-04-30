import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import type {
  ProfileContactLinks,
  ProfileFieldVisibility,
  ProfileVisibility,
  ShareableContacts,
} from "~~/shared/profile";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  handle: string | null;
  pronouns?: string | null;
  bio?: string | null;
  city?: string | null;
  visibility?: ProfileVisibility;
  fieldVisibility: ProfileFieldVisibility;
  contactLinks: ProfileContactLinks;
  shareableContacts: ShareableContacts;
};

export const profileQueryOptions = defineQueryOptions<
  { userId: string },
  ProfileRow | null
>((params) => ({
  key: queryKeys.profile(params?.userId || ""),
  query: async () => {
    if (!params?.userId) return null;

    const headers = import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined;

    return await $fetch<ProfileRow | null>("/api/me/profile", {
      credentials: "include",
      headers,
    });
  },
  enabled: Boolean(params?.userId),
  staleTime: 30_000,
}));
