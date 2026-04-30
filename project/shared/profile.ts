export const profileVisibilityOptions = [
  "public",
  "theater_only",
  "private",
] as const;

export type ProfileVisibility = (typeof profileVisibilityOptions)[number];

export const profileIdentityFieldVisibilityKeys = [
  "displayName",
  "handle",
  "pronouns",
  "city",
  "bio",
] as const;

export type ProfileIdentityFieldVisibilityKey =
  (typeof profileIdentityFieldVisibilityKeys)[number];

export type ProfileFieldVisibility = Record<
  ProfileIdentityFieldVisibilityKey,
  ProfileVisibility
>;

export type ProfileContactLinks = {
  email: {
    source: "auth";
    visibility: ProfileVisibility;
  };
  phone: {
    value: string | null;
    visibility: ProfileVisibility;
  };
};

export type ShareableContacts = {
  email: {
    value: string | null;
    visibility: ProfileVisibility;
  };
  phone: {
    value: string | null;
    visibility: ProfileVisibility;
  };
};

export const normalizeProfileFieldVisibility = (
  value: unknown,
  fallback: ProfileVisibility = "theater_only",
): ProfileFieldVisibility => {
  const root = isRecord(value) ? value : {};

  return {
    displayName: normalizeVisibility(root.displayName, fallback),
    handle: normalizeVisibility(root.handle, fallback),
    pronouns: normalizeVisibility(root.pronouns, fallback),
    city: normalizeVisibility(root.city, fallback),
    bio: normalizeVisibility(root.bio, fallback),
  };
};

const visibilitySet = new Set<ProfileVisibility>(profileVisibilityOptions);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeVisibility = (
  value: unknown,
  fallback: ProfileVisibility = "private",
): ProfileVisibility =>
  typeof value === "string" && visibilitySet.has(value as ProfileVisibility)
    ? (value as ProfileVisibility)
    : fallback;

const normalizeNullableString = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const normalizeProfileContactLinks = (
  value: unknown,
): ProfileContactLinks => {
  const root = isRecord(value) ? value : {};
  const email = isRecord(root.email) ? root.email : {};
  const phone = isRecord(root.phone) ? root.phone : {};

  return {
    email: {
      source: "auth",
      visibility: normalizeVisibility(email.visibility),
    },
    phone: {
      value: normalizeNullableString(phone.value),
      visibility: normalizeVisibility(phone.visibility),
    },
  };
};

export const buildShareableContacts = ({
  email,
  contactLinks,
}: {
  email?: string | null;
  contactLinks: ProfileContactLinks;
}): ShareableContacts => ({
  email: {
    value: normalizeNullableString(email),
    visibility: contactLinks.email.visibility,
  },
  phone: {
    value: normalizeNullableString(contactLinks.phone.value),
    visibility: contactLinks.phone.visibility,
  },
});

export const deriveProfileDisplayName = ({
  profileDisplayName,
  userMetadata,
  email,
}: {
  profileDisplayName?: string | null;
  userMetadata?: Record<string, unknown> | null;
  email?: string | null;
}) => {
  const primaryName = normalizeNullableString(profileDisplayName);
  if (primaryName) {
    return primaryName;
  }

  const metadata = userMetadata || {};
  const metaName = normalizeNullableString(
    metadata.display_name ||
      metadata.full_name ||
      metadata.name ||
      metadata.user_name,
  );
  if (metaName) {
    return metaName;
  }

  const normalizedEmail = normalizeNullableString(email);
  if (normalizedEmail) {
    const localPart = normalizedEmail.split("@")[0]?.trim();
    if (localPart) {
      return localPart;
    }
  }

  return "Anonymous";
};
