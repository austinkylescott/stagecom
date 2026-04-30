export const profileSelectWithFieldVisibility =
  "id, display_name, avatar_url, timezone, handle, pronouns, bio, city, visibility, field_visibility, contact_links";

export const profileSelectLegacy =
  "id, display_name, avatar_url, timezone, handle, pronouns, bio, city, visibility, contact_links";

export const performerProfileSelectWithFieldVisibility =
  "id,display_name,avatar_url,handle,visibility,field_visibility";

export const performerProfileSelectLegacy =
  "id,display_name,avatar_url,handle,visibility";

export const isMissingFieldVisibilityColumnError = (
  error: { message?: string | null } | null | undefined,
) => {
  const message = error?.message || "";
  return (
    message.includes("field_visibility") &&
    message.includes("does not exist")
  );
};
