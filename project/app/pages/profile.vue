<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { FormError } from "@nuxt/ui";
import type { ProfileRow } from "~/queries/users";
import type { ProfileVisibility } from "~~/shared/profile";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

type SaveReason = "autosave" | "manual";
type VisibilityPreset = ProfileVisibility | "custom";
type PreviewAudience = "public" | `theater:${string}`;
type VisibilityTarget =
  | "displayName"
  | "handle"
  | "pronouns"
  | "city"
  | "bio"
  | "email"
  | "phone";

const identity = useUserIdentity();
const { homeTheater, memberships } = useHomeTheaterState();
const toast = useToast();
const isSaving = ref(false);
const saveError = ref<string | null>(null);
const fieldErrors = ref<Record<string, string>>({});
const savedProfile = ref<ProfileRow | null>(null);
const hasHydratedProfile = ref(false);
const hasMounted = ref(false);
const lastPersistedSignature = ref("");
const lastSavedAt = ref<number | null>(null);
const queuedSave = ref<SaveReason | null>(null);
const fieldVisibilityMigrationBlocked = ref(false);
const previewAudience = ref<PreviewAudience>("public");
const membershipCount = computed(() => memberships.value.length);
const hasMemberships = computed(() => membershipCount.value > 0);

const visibilityMeta: Record<
  ProfileVisibility,
  { label: string; color: "primary" | "warning" | "neutral" }
> = {
  public: {
    label: "Public",
    color: "primary",
  },
  theater_only: {
    label: "Theater only",
    color: "warning",
  },
  private: {
    label: "Private",
    color: "neutral",
  },
};

const defaultVisibilityMeta = visibilityMeta.theater_only;

const form = reactive({
  displayName: "",
  handle: "",
  pronouns: "",
  city: "",
  bio: "",
  visibility: "theater_only" as ProfileVisibility,
  fieldVisibility: {
    displayName: "theater_only" as ProfileVisibility,
    handle: "theater_only" as ProfileVisibility,
    pronouns: "theater_only" as ProfileVisibility,
    city: "theater_only" as ProfileVisibility,
    bio: "theater_only" as ProfileVisibility,
  },
  contactLinks: {
    email: {
      visibility: "private" as ProfileVisibility,
    },
    phone: {
      value: "",
      visibility: "private" as ProfileVisibility,
    },
  },
});

const visibilityTargets: VisibilityTarget[] = [
  "displayName",
  "handle",
  "pronouns",
  "city",
  "bio",
  "email",
  "phone",
];

const applyProfileToForm = (nextProfile: ProfileRow | null = savedProfile.value) => {
  form.displayName = nextProfile?.display_name || identity.displayName.value;
  form.handle = nextProfile?.handle ?? "";
  form.pronouns = nextProfile?.pronouns ?? "";
  form.city = nextProfile?.city ?? "";
  form.bio = nextProfile?.bio ?? "";
  form.visibility = nextProfile?.visibility ?? "theater_only";
  form.fieldVisibility.displayName =
    nextProfile?.fieldVisibility.displayName ?? "theater_only";
  form.fieldVisibility.handle =
    nextProfile?.fieldVisibility.handle ?? "theater_only";
  form.fieldVisibility.pronouns =
    nextProfile?.fieldVisibility.pronouns ?? "theater_only";
  form.fieldVisibility.city =
    nextProfile?.fieldVisibility.city ?? "theater_only";
  form.fieldVisibility.bio =
    nextProfile?.fieldVisibility.bio ?? "theater_only";
  form.contactLinks.email.visibility =
    nextProfile?.contactLinks.email.visibility ?? "private";
  form.contactLinks.phone.value = nextProfile?.contactLinks.phone.value ?? "";
  form.contactLinks.phone.visibility =
    nextProfile?.contactLinks.phone.visibility ?? "private";
};

const buildProfileRequestBody = () => ({
  displayName: form.displayName,
  handle: form.handle,
  pronouns: form.pronouns,
  city: form.city,
  bio: form.bio,
  visibility: form.visibility,
  fieldVisibility: {
    displayName: form.fieldVisibility.displayName,
    handle: form.fieldVisibility.handle,
    pronouns: form.fieldVisibility.pronouns,
    city: form.fieldVisibility.city,
    bio: form.fieldVisibility.bio,
  },
  contactLinks: {
    email: {
      source: "auth" as const,
      visibility: form.contactLinks.email.visibility,
    },
    phone: {
      value: form.contactLinks.phone.value,
      visibility: form.contactLinks.phone.visibility,
    },
  },
});

const buildProfileSignature = () => JSON.stringify(buildProfileRequestBody());

const getTargetVisibility = (target: VisibilityTarget): ProfileVisibility => {
  switch (target) {
    case "displayName":
      return form.fieldVisibility.displayName;
    case "handle":
      return form.fieldVisibility.handle;
    case "pronouns":
      return form.fieldVisibility.pronouns;
    case "city":
      return form.fieldVisibility.city;
    case "bio":
      return form.fieldVisibility.bio;
    case "email":
      return form.contactLinks.email.visibility;
    case "phone":
      return form.contactLinks.phone.visibility;
  }
};

const applyVisibilityToAllFields = (visibility: ProfileVisibility) => {
  form.visibility = visibility;
  form.fieldVisibility.displayName = visibility;
  form.fieldVisibility.handle = visibility;
  form.fieldVisibility.pronouns = visibility;
  form.fieldVisibility.city = visibility;
  form.fieldVisibility.bio = visibility;
  form.contactLinks.email.visibility = visibility;
  form.contactLinks.phone.visibility = visibility;
};

const matchesOverallPreset = (visibility: ProfileVisibility) =>
  visibilityTargets.every((target) => getTargetVisibility(target) === visibility);

const overallVisibilityPreset = computed<VisibilityPreset>(() =>
  matchesOverallPreset(form.visibility) ? form.visibility : "custom",
);

const requestHeaders = import.meta.server
  ? useRequestHeaders(["cookie"])
  : undefined;

const {
  data: initialProfile,
  pending: isProfileSnapshotLoading,
  refresh: refreshSavedProfile,
} = await useAsyncData("profile-page-record", () =>
  $fetch<ProfileRow | null>("/api/me/profile", {
    credentials: "include",
    headers: requestHeaders,
  }),
);

watch(
  () => initialProfile.value,
  (nextProfile) => {
    savedProfile.value = nextProfile;
    identity.setProfile(nextProfile);
    applyProfileToForm(nextProfile);
    lastPersistedSignature.value = buildProfileSignature();
    if (import.meta.client && hasMounted.value) {
      lastSavedAt.value = Date.now();
    }
    hasHydratedProfile.value = true;
  },
  { immediate: true },
);

watch(
  () => identity.displayName.value,
  (nextDisplayName) => {
    if (!savedProfile.value?.display_name && !form.displayName) {
      form.displayName = nextDisplayName;
      lastPersistedSignature.value = buildProfileSignature();
    }
  },
);

onMounted(() => {
  hasMounted.value = true;
  void refreshSavedProfile();
});

const collectFieldErrors = (
  issues: Array<{ path?: string | null; message?: string }>,
) =>
  Object.fromEntries(
    issues
      .filter((issue) => issue.path && issue.message)
      .map((issue) => [issue.path as string, issue.message as string]),
  );

const submitErrors = computed<FormError[]>(() =>
  Object.entries(fieldErrors.value).map(([name, message]) => ({
    name,
    message,
  })),
);

const draftSignature = computed(() => buildProfileSignature());
const hasPendingChanges = computed(
  () => hasHydratedProfile.value && draftSignature.value !== lastPersistedSignature.value,
);
const hasMixedFieldVisibility = computed(
  () => overallVisibilityPreset.value === "custom",
);
const shouldPauseAutosaveForMigration = computed(
  () => fieldVisibilityMigrationBlocked.value && hasMixedFieldVisibility.value,
);

const profileHeroName = computed(() => {
  const normalized = form.displayName.trim();
  return normalized.length ? normalized : identity.displayName.value;
});

const profileHeroHandle = computed(() => {
  const normalized = form.handle.trim();
  return normalized.length ? `@${normalized}` : null;
});

const previewAudienceOptions = computed(() => [
  {
    label: "Public person",
    value: "public" as const,
    icon: "i-lucide-globe",
    description: "What any Stagecom user could see.",
  },
  ...memberships.value.map(({ theater, membership }) => ({
    label: `${theater.name} theater member`,
    value: `theater:${theater.id}` as const,
    icon: membership.isHome ? "i-lucide-house" : "i-lucide-users",
    description: membership.isHome
      ? "Preview as someone who shares your home theater."
      : `Preview as someone who shares ${theater.name}.`,
  })),
]);

const selectedPreviewAudience = computed(
  () =>
    previewAudienceOptions.value.find((option) => option.value === previewAudience.value) ??
    previewAudienceOptions.value[0],
);

const currentVisibilityMeta = computed(
  () => visibilityMeta[form.visibility as ProfileVisibility] ?? defaultVisibilityMeta,
);

const isTheaterPreviewAudience = computed(
  () => previewAudience.value !== "public",
);

watch(
  previewAudienceOptions,
  (options) => {
    if (!options.some((option) => option.value === previewAudience.value)) {
      previewAudience.value = "public";
    }
  },
  { immediate: true },
);

const isFieldVisibleInPreview = (visibility: ProfileVisibility) => {
  if (form.visibility === "private") {
    return false;
  }

  if (!isTheaterPreviewAudience.value) {
    return form.visibility === "public" && visibility === "public";
  }

  return visibility === "public" || visibility === "theater_only";
};

const isProfileDiscoverableInPreview = computed(() => {
  if (form.visibility === "private") {
    return false;
  }

  if (!isTheaterPreviewAudience.value) {
    return form.visibility === "public";
  }

  return true;
});

const previewField = (
  value: string | null | undefined,
  visibility: ProfileVisibility,
) => {
  const normalized = value?.trim() || null;

  return {
    value: normalized,
    visible: normalized ? isFieldVisibleInPreview(visibility) : true,
  };
};

const hiddenPreviewCopy = (label: string) => `${label} hidden for this viewer`;

const previewName = computed(() =>
  previewField(profileHeroName.value, form.fieldVisibility.displayName),
);
const previewHandle = computed(() =>
  previewField(form.handle ? `@${form.handle.trim()}` : null, form.fieldVisibility.handle),
);
const previewPronouns = computed(() =>
  previewField(form.pronouns, form.fieldVisibility.pronouns),
);
const previewCity = computed(() =>
  previewField(form.city, form.fieldVisibility.city),
);
const previewBio = computed(() =>
  previewField(form.bio, form.fieldVisibility.bio),
);
const previewEmail = computed(() =>
  previewField(identity.email.value, form.contactLinks.email.visibility),
);
const previewPhone = computed(() =>
  previewField(form.contactLinks.phone.value, form.contactLinks.phone.visibility),
);

const profileStatus = computed(() => {
  if (isProfileSnapshotLoading.value && !hasHydratedProfile.value) {
    return "Loading your profile...";
  }

  if (isSaving.value) {
    return "Saving changes...";
  }

  if (saveError.value) {
    return saveError.value;
  }

  if (shouldPauseAutosaveForMigration.value) {
    return "Mixed field visibility is paused until this environment gets the latest profile migration.";
  }

  if (hasPendingChanges.value) {
    return "Autosave will persist your edits when you pause typing.";
  }

  if (lastSavedAt.value) {
    return `Saved ${new Date(lastSavedAt.value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return "Profile ready.";
});

const saveStatusTone = computed<
  "primary" | "warning" | "error" | "neutral"
>(() => {
  if (saveError.value) {
    return "error";
  }

  if (isSaving.value) {
    return "warning";
  }

  if (hasPendingChanges.value) {
    return "warning";
  }

  return "primary";
});

const saveProfile = async ({ reason }: { reason: SaveReason }) => {
  if (isSaving.value) {
    queuedSave.value = reason;
    return;
  }

  saveError.value = null;
  fieldErrors.value = {};
  isSaving.value = true;
  const requestBody = buildProfileRequestBody();
  const requestSignature = JSON.stringify(requestBody);

  try {
    const nextSavedProfile = await $fetch<ProfileRow>("/api/me/profile", {
      method: "POST",
      credentials: "include",
      body: requestBody,
    });

    identity.setProfile(nextSavedProfile);
    savedProfile.value = nextSavedProfile;
    lastPersistedSignature.value = requestSignature;
    fieldVisibilityMigrationBlocked.value = false;

    if (draftSignature.value === requestSignature) {
      applyProfileToForm(nextSavedProfile);
      lastPersistedSignature.value = buildProfileSignature();
    }

    lastSavedAt.value = Date.now();
    toast?.add({
      title: reason === "autosave" ? "Profile autosaved" : "Profile saved",
      description:
        reason === "autosave"
          ? "Your latest profile edits are now on record."
          : "Your profile changes are now on record.",
      color: "success",
      icon: "i-lucide-check-circle",
      duration: 1800,
    });
  } catch (error: any) {
    const issues = error?.data?.issues;
    if (Array.isArray(issues)) {
      fieldErrors.value = collectFieldErrors(issues);
    }

    fieldVisibilityMigrationBlocked.value = Boolean(
      Array.isArray(issues) &&
        issues.some((issue) => issue?.path === "fieldVisibility"),
    );

    saveError.value =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Unable to save profile.";
  } finally {
    isSaving.value = false;

    if (queuedSave.value) {
      const nextReason = queuedSave.value;
      queuedSave.value = null;

      if (draftSignature.value !== lastPersistedSignature.value) {
        await saveProfile({ reason: nextReason });
      }
    }
  }
};

watchDebounced(
  draftSignature,
  async () => {
    if (!hasHydratedProfile.value || isProfileSnapshotLoading.value) {
      return;
    }

    if (shouldPauseAutosaveForMigration.value) {
      return;
    }

    if (draftSignature.value === lastPersistedSignature.value) {
      return;
    }

    await saveProfile({ reason: "autosave" });
  },
  {
    debounce: 1200,
    maxWait: 5000,
  },
);
</script>

<template>
  <div class="min-h-screen bg-(--stage-cream) px-4 py-6 md:px-8 md:py-10">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header class="space-y-3">
        <p class="stage-kicker">Account Settings</p>
        <div class="space-y-2">
          <h1 class="stage-title text-5xl md:text-7xl">Profile</h1>
          <p class="max-w-3xl text-base text-(--stage-ink-soft) md:text-lg">
            Edit the profile card itself. Visibility badges update live and your
            changes autosave after you pause.
          </p>
        </div>
      </header>

      <UForm
        :state="form"
        :errors="submitErrors"
        class="space-y-6"
      >
        <section class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div class="space-y-1">
            <p class="stage-kicker">Preview Viewer</p>
            <h2 class="stage-section-title">View the card as someone else</h2>
          </div>
          <div class="w-full max-w-xl space-y-2">
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <span class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink-soft)">
                View as
              </span>
              <USelectMenu
                v-model="previewAudience"
                value-key="value"
                :items="previewAudienceOptions"
                class="w-full md:w-80"
              />
            </div>
            <p class="text-sm text-(--stage-ink-soft) md:text-right">
              {{ selectedPreviewAudience?.description }}
            </p>
          </div>
        </section>

        <UCard
          :ui="{
            root: 'overflow-hidden',
            body: 'space-y-6',
          }"
        >
          <section class="space-y-4 border-b-2 border-(--stage-ink) pb-5">
            <div class="flex items-start gap-4">
              <div class="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-(--stage-ink) bg-stage-surface-theater font-(family-name:--font-display) text-3xl uppercase">
                {{ identity.initials.value }}
              </div>
              <div class="min-w-0 flex-1 space-y-3">
                <div class="space-y-1">
                  <p class="stage-kicker">Preview Card</p>
                  <div class="space-y-2">
                    <h2
                      class="stage-section-title min-h-12 text-3xl md:text-4xl"
                      :class="{
                        'text-(--stage-ink-soft)': !isProfileDiscoverableInPreview || !previewName.visible,
                      }"
                    >
                      {{
                        isProfileDiscoverableInPreview
                          ? previewName.visible
                            ? (previewName.value || "Anonymous")
                            : hiddenPreviewCopy("Name")
                          : "Profile hidden for this viewer"
                      }}
                    </h2>

                    <p
                      class="min-h-5 text-sm font-semibold"
                      :class="{
                        'text-(--stage-ink-soft)': !previewHandle.visible || !previewHandle.value,
                        'text-(--stage-ink)': previewHandle.visible && previewHandle.value,
                      }"
                    >
                      {{
                        isProfileDiscoverableInPreview
                          ? previewHandle.visible
                            ? (previewHandle.value || "No handle")
                            : hiddenPreviewCopy("Handle")
                          : " "
                      }}
                    </p>
                  </div>
                </div>

                <div class="grid gap-3 md:grid-cols-2">
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-(--stage-ink-soft)">
                      Pronouns
                    </p>
                    <p
                      class="min-h-5 text-sm"
                      :class="{
                        'text-(--stage-ink-soft)': !previewPronouns.visible || !previewPronouns.value,
                        'text-(--stage-ink)': previewPronouns.visible && previewPronouns.value,
                      }"
                    >
                      {{
                        isProfileDiscoverableInPreview
                          ? previewPronouns.visible
                            ? (previewPronouns.value || "Not provided")
                            : hiddenPreviewCopy("Pronouns")
                          : " "
                      }}
                    </p>
                  </div>

                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-(--stage-ink-soft)">
                      City
                    </p>
                    <p
                      class="min-h-5 text-sm"
                      :class="{
                        'text-(--stage-ink-soft)': !previewCity.visible || !previewCity.value,
                        'text-(--stage-ink)': previewCity.visible && previewCity.value,
                      }"
                    >
                      {{
                        isProfileDiscoverableInPreview
                          ? previewCity.visible
                            ? (previewCity.value || "Not provided")
                            : hiddenPreviewCopy("City")
                          : " "
                      }}
                    </p>
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-(--stage-ink-soft)">
                    Bio
                  </p>
                  <p
                    class="min-h-18 max-w-2xl whitespace-pre-line text-sm leading-6"
                    :class="{
                      'text-(--stage-ink-soft)': !previewBio.visible || !previewBio.value,
                      'text-(--stage-ink)': previewBio.visible && previewBio.value,
                    }"
                  >
                    {{
                      isProfileDiscoverableInPreview
                        ? previewBio.visible
                          ? (previewBio.value || "No bio added yet.")
                          : hiddenPreviewCopy("Bio")
                        : " "
                    }}
                  </p>
                </div>

                <div class="grid gap-3 md:grid-cols-2">
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-(--stage-ink-soft)">
                      Email
                    </p>
                    <p
                      class="min-h-5 text-sm"
                      :class="{
                        'text-(--stage-ink-soft)': !previewEmail.visible || !previewEmail.value,
                        'text-(--stage-ink)': previewEmail.visible && previewEmail.value,
                      }"
                    >
                      {{
                        isProfileDiscoverableInPreview
                          ? previewEmail.visible
                            ? (previewEmail.value || "Not provided")
                            : hiddenPreviewCopy("Email")
                          : " "
                      }}
                    </p>
                  </div>

                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-(--stage-ink-soft)">
                      Phone
                    </p>
                    <p
                      class="min-h-5 text-sm"
                      :class="{
                        'text-(--stage-ink-soft)': !previewPhone.visible || !previewPhone.value,
                        'text-(--stage-ink)': previewPhone.visible && previewPhone.value,
                      }"
                    >
                      {{
                        isProfileDiscoverableInPreview
                          ? previewPhone.visible
                            ? (previewPhone.value || "Not provided")
                            : hiddenPreviewCopy("Phone")
                          : " "
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-(--stage-ink-soft)">
            <div class="flex items-center gap-2">
              <span
                class="inline-block h-2.5 w-2.5 rounded-full"
                :class="{
                  'bg-(--stage-theater)': saveStatusTone === 'primary',
                  'bg-(--stage-event)': saveStatusTone === 'warning',
                  'bg-(--stage-performer)': saveStatusTone === 'error',
                }"
              />
              <span>{{ profileStatus }}</span>
            </div>
            <span>
              Discoverability: {{ currentVisibilityMeta.label }}.
            </span>
          </div>

          <section class="space-y-4 border-b border-default pb-5">
            <div class="space-y-2">
              <p class="stage-kicker">Visibility</p>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="space-y-1">
                  <h3 class="stage-section-title">Set all fields at once</h3>
                  <p class="max-w-3xl text-sm text-(--stage-ink-soft)">
                    Choosing Public, Theater Only, or Private updates the profile
                    discoverability setting and every field toggle below to match.
                    If you mix field-level settings afterward, this switches to Custom.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <ProfileVisibilityToggleGroup
                :model-value="form.visibility"
                :disabled="isSaving"
                mode="expanded"
                show-custom
                :custom-active="overallVisibilityPreset === 'custom'"
                @update:model-value="applyVisibilityToAllFields"
              />
              <div
                v-if="fieldVisibilityMigrationBlocked"
                class="rounded-none border-2 border-(--stage-performer) bg-stage-surface-paper px-4 py-3 text-sm text-(--stage-ink)"
              >
                This environment cannot save mixed field visibility yet. Apply the
                latest profile migration, then reload this page to keep using
                Custom visibility.
              </div>
              <p class="text-xs text-(--stage-ink-soft)">
                Discoverability stays at {{ currentVisibilityMeta.label }} until
                you choose a new overall setting.
              </p>
            </div>
          </section>

          <section class="space-y-4">
            <div class="space-y-2">
              <p class="stage-kicker">Identity</p>
              <h3 class="stage-section-title">Field overrides</h3>
            </div>

            <div class="grid gap-4 xl:grid-cols-2">
              <UFormField
                name="displayName"
                :error="fieldErrors.displayName"
              >
                <div class="space-y-3">
                  <div class="space-y-1">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                        Display name
                      </p>
                      <p class="text-xs text-(--stage-ink-soft)">
                        The primary name people see on your profile card.
                      </p>
                    </div>
                  </div>
                  <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div>
                      <UInput
                        v-model="form.displayName"
                        class="w-full"
                        placeholder="How your name should appear"
                      />
                    </div>
                    <ProfileVisibilityToggleGroup
                      v-model="form.fieldVisibility.displayName"
                      :disabled="isSaving"
                    />
                  </div>
                </div>
              </UFormField>

              <UFormField
                name="handle"
                :error="fieldErrors.handle"
              >
                <div class="space-y-3">
                  <div class="space-y-1">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                        Handle
                      </p>
                      <p class="text-xs text-(--stage-ink-soft)">
                        Optional identity for public or theater-scoped discovery.
                      </p>
                    </div>
                  </div>
                  <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <UInput
                      v-model="form.handle"
                      class="w-full"
                      placeholder="your-name"
                    />
                    <ProfileVisibilityToggleGroup
                      v-model="form.fieldVisibility.handle"
                      :disabled="isSaving"
                    />
                  </div>
                  <p class="text-xs text-(--stage-ink-soft)">
                    Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>
              </UFormField>

              <UFormField
                name="pronouns"
                :error="fieldErrors.pronouns"
              >
                <div class="space-y-3">
                  <div class="space-y-1">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                        Pronouns
                      </p>
                      <p class="text-xs text-(--stage-ink-soft)">
                        Shared only at the level shown by the badge.
                      </p>
                    </div>
                  </div>
                  <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <UInput
                      v-model="form.pronouns"
                      class="w-full"
                      placeholder="they/them"
                    />
                    <ProfileVisibilityToggleGroup
                      v-model="form.fieldVisibility.pronouns"
                      :disabled="isSaving"
                    />
                  </div>
                </div>
              </UFormField>

              <UFormField
                name="city"
                :error="fieldErrors.city"
              >
                <div class="space-y-3">
                  <div class="space-y-1">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                        City
                      </p>
                      <p class="text-xs text-(--stage-ink-soft)">
                        Useful for local theater context without exposing more than you want.
                      </p>
                    </div>
                  </div>
                  <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <UInput
                      v-model="form.city"
                      class="w-full"
                      placeholder="Brooklyn, NY"
                    />
                    <ProfileVisibilityToggleGroup
                      v-model="form.fieldVisibility.city"
                      :disabled="isSaving"
                    />
                  </div>
                </div>
              </UFormField>
            </div>

            <UFormField
              name="bio"
              :error="fieldErrors.bio"
            >
              <div class="space-y-3">
                <div class="space-y-1">
                  <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                      Bio
                    </p>
                    <p class="text-xs text-(--stage-ink-soft)">
                      Tell theaters and castmates how you show up.
                    </p>
                  </div>
                </div>
                <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <UTextarea
                    v-model="form.bio"
                    class="w-full"
                    :rows="5"
                    placeholder="Tell theaters and castmates how you show up."
                  />
                  <ProfileVisibilityToggleGroup
                    v-model="form.fieldVisibility.bio"
                    :disabled="isSaving"
                  />
                </div>
              </div>
            </UFormField>
          </section>

          <section class="space-y-4">
            <div class="space-y-2">
              <p class="stage-kicker">Contact</p>
              <h3 class="stage-section-title">Contact overrides</h3>
            </div>

            <div class="grid gap-4 xl:grid-cols-2">
              <UFormField
                name="contactLinks.email.visibility"
                :error="fieldErrors['contactLinks.email.visibility']"
              >
                <div class="space-y-3">
                  <div class="space-y-1">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                        Signed-in email
                      </p>
                      <p class="text-xs text-(--stage-ink-soft)">
                        This email comes from your account record.
                      </p>
                    </div>
                  </div>
                  <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div class="flex min-h-11 items-center rounded-none border-2 border-(--stage-ink) bg-stage-surface-paper-strong px-3 py-2 text-sm text-(--stage-ink)">
                      {{ identity.email.value || "No account email" }}
                    </div>
                    <ProfileVisibilityToggleGroup
                      v-model="form.contactLinks.email.visibility"
                      :disabled="isSaving"
                    />
                  </div>
                </div>
              </UFormField>

              <UFormField
                name="contactLinks.phone.value"
                :error="fieldErrors['contactLinks.phone.value']"
              >
                <div class="space-y-3">
                  <div class="space-y-1">
                    <div>
                      <p class="text-sm font-semibold uppercase tracking-[0.16em] text-(--stage-ink)">
                        Phone number
                      </p>
                      <p class="text-xs text-(--stage-ink-soft)">
                        Optional direct contact for theater operations.
                      </p>
                    </div>
                  </div>
                  <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <UInput
                      v-model="form.contactLinks.phone.value"
                      class="w-full"
                      placeholder="Optional phone number"
                    />
                    <ProfileVisibilityToggleGroup
                      v-model="form.contactLinks.phone.visibility"
                      :disabled="isSaving"
                    />
                  </div>
                </div>
              </UFormField>
            </div>
          </section>

          <div class="flex flex-wrap items-center justify-between gap-4 border-t-2 border-(--stage-ink) pt-4">
            <div class="space-y-1">
              <p class="text-sm text-(--stage-ink-soft)">
                Current home theater: {{ homeTheater?.name || "No home theater selected" }}.
              </p>
              <p class="text-sm text-(--stage-ink-soft)">
                The preview card and viewer selector both use this same draft state,
                so changing the viewer does not require a separate save.
              </p>
            </div>
            <UButton
              type="button"
              color="warning"
              size="lg"
              :loading="isSaving"
              @click="saveProfile({ reason: 'manual' })"
            >
              Save now
            </UButton>
          </div>
        </UCard>
      </UForm>

      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="stage-kicker">Memberships</p>
            <h2 class="stage-section-title">Your active theaters</h2>
            <p class="max-w-2xl text-sm text-(--stage-ink-soft)">
              Memberships are supporting account context here. You can still
              open a theater, change your home theater, or leave from this
              section.
            </p>
          </div>
          <UBadge color="primary">
            {{ membershipCount }} active theater{{ membershipCount === 1 ? "" : "s" }}
          </UBadge>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          <div
            v-if="!hasMemberships"
            class="stage-message xl:col-span-2"
          >
            You do not have any active theater memberships yet.
          </div>
          <ProfileMembershipCard
            v-for="membership in memberships"
            :key="membership.theater.id"
            :membership="membership"
          />
        </div>
      </section>
    </div>
  </div>
</template>
