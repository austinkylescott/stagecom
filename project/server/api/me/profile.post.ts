import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";
import type { Enums } from "~/types/database.types";
import {
  buildShareableContacts,
  deriveProfileDisplayName,
  normalizeProfileFieldVisibility,
  normalizeProfileContactLinks,
  profileVisibilityOptions,
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

const emptyToNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const visibilitySchema = z.enum(profileVisibilityOptions);

const nullableStringSchema = z.preprocess(
  emptyToNull,
  z.string().trim().nullable(),
);

const handleSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string") return value;
    const trimmed = value.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
  },
  z
    .string()
    .min(3, "Handle must be at least 3 characters")
    .max(60, "Handle must be 60 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Handle can only use lowercase letters, numbers, and single hyphens",
    )
    .nullable(),
);

const bodySchema = z.object({
  displayName: z.preprocess(
    emptyToNull,
    z.string().trim().min(1).nullable(),
  ).optional(),
  avatarUrl: z.preprocess(emptyToNull, z.string().url().nullable()).optional(),
  timezone: z.preprocess(emptyToNull, z.string().trim().nullable()).optional(),
  handle: handleSchema.optional(),
  pronouns: nullableStringSchema.optional(),
  bio: nullableStringSchema.optional(),
  city: nullableStringSchema.optional(),
  phone: nullableStringSchema.optional(),
  visibility: visibilitySchema.optional(),
  fieldVisibility: z
    .object({
      displayName: visibilitySchema.optional(),
      handle: visibilitySchema.optional(),
      pronouns: visibilitySchema.optional(),
      city: visibilitySchema.optional(),
      bio: visibilitySchema.optional(),
    })
    .optional(),
  emailVisibility: visibilitySchema.optional(),
  phoneVisibility: visibilitySchema.optional(),
  contactLinks: z
    .object({
      email: z
        .object({
          source: z.literal("auth").optional(),
          visibility: visibilitySchema.optional(),
        })
        .optional(),
      phone: z
        .object({
          value: nullableStringSchema.optional(),
          visibility: visibilitySchema.optional(),
        })
        .optional(),
    })
    .optional(),
});

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
};

const buildIssueError = ({
  statusCode,
  path,
  message,
}: {
  statusCode: number;
  path: string;
  message: string;
}) =>
  createError({
    statusCode,
    statusMessage: message,
    data: {
      error: "validation_error",
      source: "body",
      issues: [
        {
          code: "custom",
          message,
          path,
        },
      ],
    },
  });

export default defineEventHandler(async (event) => {
  const authSupabase = await serverSupabaseClient(event);
  const user = await requireUser(event, authSupabase);
  const supabase = getProfileClient(authSupabase);
  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const payload = await parseBody(event, bodySchema);

  let supportsFieldVisibility = true;
  let { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select(profileSelectWithFieldVisibility)
    .eq("id", user.id)
    .maybeSingle();

  if (isMissingFieldVisibilityColumnError(existingProfileError)) {
    supportsFieldVisibility = false;
    ({ data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select(profileSelectLegacy)
      .eq("id", user.id)
      .maybeSingle());
  }

  if (existingProfileError) {
    throw createError({
      statusCode: 500,
      statusMessage: existingProfileError.message,
    });
  }

  const existingContactLinks = normalizeProfileContactLinks(
    existingProfile?.contact_links,
  );
  const displayName = deriveProfileDisplayName({
    profileDisplayName:
      payload.displayName === undefined
        ? existingProfile?.display_name
        : payload.displayName,
    userMetadata: metadata,
    email: user.email,
  });
  const visibility: Enums<"profile_visibility"> =
    payload.visibility ?? existingProfile?.visibility ?? "theater_only";
  const existingFieldVisibility = normalizeProfileFieldVisibility(
    existingProfile?.field_visibility,
    existingProfile?.visibility ?? visibility,
  );
  const legacyFieldVisibilityOverride = payload.visibility ?? null;
  const fieldVisibility = normalizeProfileFieldVisibility(
    {
      displayName:
        payload.fieldVisibility?.displayName ??
        legacyFieldVisibilityOverride ??
        existingFieldVisibility.displayName,
      handle:
        payload.fieldVisibility?.handle ??
        legacyFieldVisibilityOverride ??
        existingFieldVisibility.handle,
      pronouns:
        payload.fieldVisibility?.pronouns ??
        legacyFieldVisibilityOverride ??
        existingFieldVisibility.pronouns,
      city:
        payload.fieldVisibility?.city ??
        legacyFieldVisibilityOverride ??
        existingFieldVisibility.city,
      bio:
        payload.fieldVisibility?.bio ??
        legacyFieldVisibilityOverride ??
        existingFieldVisibility.bio,
    },
    visibility,
  );

  if (
    !supportsFieldVisibility &&
    payload.fieldVisibility &&
    Object.values(fieldVisibility).some((value) => value !== visibility)
  ) {
    throw buildIssueError({
      statusCode: 409,
      path: "fieldVisibility",
      message:
        "Field-level visibility overrides require the latest profile migration.",
    });
  }

  const handle =
    payload.handle === undefined ? (existingProfile?.handle ?? null) : payload.handle;
  const contactLinks = normalizeProfileContactLinks({
    email: {
      source: "auth",
      visibility:
        payload.contactLinks?.email?.visibility ??
        payload.emailVisibility ??
        existingContactLinks.email.visibility,
    },
    phone: {
      value:
        payload.contactLinks?.phone?.value ??
        payload.phone ??
        existingContactLinks.phone.value,
      visibility:
        payload.contactLinks?.phone?.visibility ??
        payload.phoneVisibility ??
        existingContactLinks.phone.visibility,
    },
  });

  if (handle) {
    const { data: conflictingProfile, error: conflictingProfileError } =
      await supabase
        .from("profiles")
        .select("id")
        .ilike("handle", handle)
        .neq("id", user.id)
        .maybeSingle();

    if (conflictingProfileError) {
      throw createError({
        statusCode: 500,
        statusMessage: conflictingProfileError.message,
      });
    }

    if (conflictingProfile) {
      throw buildIssueError({
        statusCode: 409,
        path: "handle",
        message: "That handle is already in use.",
      });
    }
  }

  const upsertPayload: Record<string, unknown> = {
    id: user.id,
    display_name: displayName,
    avatar_url:
      payload.avatarUrl === undefined
        ? (existingProfile?.avatar_url ?? null)
        : payload.avatarUrl,
    timezone:
      payload.timezone === undefined
        ? (existingProfile?.timezone ?? "UTC")
        : (payload.timezone ?? existingProfile?.timezone ?? "UTC"),
    handle,
    pronouns:
      payload.pronouns === undefined
        ? (existingProfile?.pronouns ?? null)
        : payload.pronouns,
    bio: payload.bio === undefined ? (existingProfile?.bio ?? null) : payload.bio,
    city:
      payload.city === undefined ? (existingProfile?.city ?? null) : payload.city,
    contact_links: contactLinks,
    visibility,
  };

  if (supportsFieldVisibility) {
    upsertPayload.field_visibility = fieldVisibility;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(upsertPayload, { onConflict: "id" })
    .select(
      supportsFieldVisibility
        ? profileSelectWithFieldVisibility
        : profileSelectLegacy,
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw buildIssueError({
        statusCode: 409,
        path: "handle",
        message: "That handle is already in use.",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  const normalizedContactLinks = normalizeProfileContactLinks(data.contact_links);
  const normalizedFieldVisibility = normalizeProfileFieldVisibility(
    supportsFieldVisibility ? data.field_visibility : null,
    data.visibility,
  );

  return {
    avatar_url: data.avatar_url,
    bio: data.bio,
    city: data.city,
    contactLinks: normalizedContactLinks,
    display_name: data.display_name,
    fieldVisibility: normalizedFieldVisibility,
    handle: data.handle,
    id: data.id,
    pronouns: data.pronouns,
    shareableContacts: buildShareableContacts({
      email: user.email,
      contactLinks: normalizedContactLinks,
    }),
    timezone: data.timezone,
    visibility: data.visibility,
  } satisfies MeProfileResponse;
});
