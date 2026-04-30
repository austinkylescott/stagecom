import { serverSupabaseClient } from "#supabase/server";
import type { Enums } from "~/types/database.types";
import {
  buildShareableContacts,
  normalizeProfileFieldVisibility,
  normalizeProfileContactLinks,
  type ProfileFieldVisibility,
  type ProfileContactLinks,
  type ShareableContacts,
} from "~~/shared/profile";
import {
  isMissingFieldVisibilityColumnError,
  profileSelectLegacy,
  profileSelectWithFieldVisibility,
} from "~~/server/utils/profile-field-visibility";
import { getProfileClient } from "~~/server/utils/profile-client";

type MeProfileResponse = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  handle: string | null;
  pronouns: string | null;
  bio: string | null;
  city: string | null;
  visibility: Enums<"profile_visibility">;
  fieldVisibility: ProfileFieldVisibility;
  contactLinks: ProfileContactLinks;
  shareableContacts: ShareableContacts;
} | null;

export default defineEventHandler(async (event): Promise<MeProfileResponse> => {
  const authSupabase = await serverSupabaseClient(event);
  const user = await requireUser(event, authSupabase);
  const supabase = getProfileClient(authSupabase);

  let supportsFieldVisibility = true;
  let { data, error } = await supabase
    .from("profiles")
    .select(profileSelectWithFieldVisibility)
    .eq("id", user.id)
    .maybeSingle();

  if (isMissingFieldVisibilityColumnError(error)) {
    supportsFieldVisibility = false;
    ({ data, error } = await supabase
      .from("profiles")
      .select(profileSelectLegacy)
      .eq("id", user.id)
      .maybeSingle());
  }

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  if (!data) {
    return null;
  }

  const contactLinks = normalizeProfileContactLinks(data.contact_links);
  const fieldVisibility = normalizeProfileFieldVisibility(
    supportsFieldVisibility ? data.field_visibility : null,
    data.visibility,
  );

  return {
    avatar_url: data.avatar_url,
    bio: data.bio,
    city: data.city,
    contactLinks,
    display_name: data.display_name,
    fieldVisibility,
    handle: data.handle,
    id: data.id,
    pronouns: data.pronouns,
    shareableContacts: buildShareableContacts({
      email: user.email,
      contactLinks,
    }),
    timezone: data.timezone,
    visibility: data.visibility,
  };
});
