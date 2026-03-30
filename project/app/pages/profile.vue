<script setup lang="ts">
const user = useSupabaseUser();

// Keep the reactive profile in sync with the canonical row we control.
const { profile, profileError, refreshProfile } = useUserIdentity();

const form = reactive({
  displayName: "",
  avatarUrl: "",
  timezone: "UTC",
  pronouns: "",
  bio: "",
  city: "",
  visibility: "theater_only",
});

const initial = reactive({
  displayName: "",
  avatarUrl: "",
  timezone: "UTC",
  pronouns: "",
  bio: "",
  city: "",
  visibility: "theater_only",
});

const loading = ref(false);
const notice = ref("");
const error = ref("");
const hydrated = ref(false);
const visibilityItems = [
  { label: "Public", value: "public" },
  { label: "Theater-only", value: "theater_only" },
  { label: "Private", value: "private" },
];
const pronounItems = [
  { label: "he/him", value: "he/him" },
  { label: "she/her", value: "she/her" },
  { label: "they/them", value: "they/them" },
  { label: "–––", value: null },
];

watch(
  () => [user.value?.id, profile.value],
  () => {
    if (!user.value) return;

    // Populate form from the latest profile/user data.
    const data = profile.value;
    form.displayName = data?.display_name || user.value.email || "";
    form.avatarUrl = data?.avatar_url || "";
    form.timezone = data?.timezone || "UTC";
    form.pronouns = data?.pronouns || "";
    form.bio = data?.bio || "";
    form.city = data?.city || "";
    form.visibility = data?.visibility || "theater_only";

    // Capture a clean baseline for dirty checking.
    initial.displayName = form.displayName;
    initial.avatarUrl = form.avatarUrl;
    initial.timezone = form.timezone;
    initial.pronouns = form.pronouns;
    initial.bio = form.bio;
    initial.city = form.city;
    initial.visibility = form.visibility;
    hydrated.value = true;
  },
  { immediate: true },
);

const isDirty = computed(
  () =>
    form.displayName !== initial.displayName ||
    form.avatarUrl !== initial.avatarUrl ||
    form.timezone !== initial.timezone ||
    form.pronouns !== initial.pronouns ||
    form.bio !== initial.bio ||
    form.city !== initial.city ||
    form.visibility !== initial.visibility,
);

const save = async () => {
  if (!user.value) return;
  if (!form.displayName.trim()) {
    error.value = "Display name is required";
    return;
  }

  loading.value = true;
  notice.value = "";
  error.value = "";

  try {
    await $fetch("/api/me/profile", {
      method: "POST",
      credentials: "include",
      body: {
        displayName: form.displayName,
        avatarUrl: form.avatarUrl || null,
        timezone: form.timezone || "UTC",
        pronouns: form.pronouns || null,
        bio: form.bio || null,
        city: form.city || null,
        visibility: form.visibility || "theater_only",
      },
    });
    notice.value = "Profile updated";
    await refreshProfile();
    initial.displayName = form.displayName;
    initial.avatarUrl = form.avatarUrl;
    initial.timezone = form.timezone;
    initial.pronouns = form.pronouns;
    initial.bio = form.bio;
    initial.city = form.city;
    initial.visibility = form.visibility;
  } catch (upsertError: any) {
    error.value =
      upsertError?.data?.statusMessage ||
      upsertError?.data?.message ||
      upsertError?.message ||
      "Failed to update profile";
  }
  loading.value = false;
};
</script>

<template>
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] stage-texture overflow-hidden" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div>
        <span class="stage-kicker">Profile</span>
        <h1 class="mt-4 stage-section-title">How you appear across the scene.</h1>
        <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
          Keep your identity readable for producers and theaters while staying explicit about what is public, theater-only, or private.
        </p>
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.52)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <UAlert v-if="!user" color="yellow" variant="soft">
        <template #title>Sign in required</template>
        <template #description>Log in to edit your profile.</template>
      </UAlert>

      <section v-else class="stage-page-grid stage-page-grid-rail">
        <div class="stage-panel p-5 sm:p-6">
          <div class="space-y-4">
            <UFormField label="Display name" required>
              <UInput v-model="form.displayName" />
            </UFormField>

            <UFormField label="Avatar URL" description="Optional">
              <UInput
                v-model="form.avatarUrl"
                placeholder="https://example.com/avatar.png"
              />
            </UFormField>

            <UFormField label="Pronouns" description="Optional">
              <USelectMenu
                v-model="form.pronouns"
                :items="pronounItems"
                value-key="value"
                class="w-full"
              />
            </UFormField>

            <UFormField label="City" description="Helps theaters find locals">
              <UInput v-model="form.city" placeholder="Chicago, IL" />
            </UFormField>

            <UFormField label="Bio" description="Short intro or team affiliation">
              <UTextarea v-model="form.bio" :rows="3" />
            </UFormField>

            <UFormField
              label="Timezone"
              description="IANA name, e.g. America/New_York"
            >
              <UInput v-model="form.timezone" placeholder="UTC" />
            </UFormField>

            <UFormField
              label="Profile visibility"
              description="Who can see your profile details"
            >
              <USelectMenu
                v-model="form.visibility"
                :items="visibilityItems"
                class="w-full"
                value-key="value"
              />
            </UFormField>

            <div class="flex items-center gap-2 flex-wrap">
              <UButton
                :loading="loading"
                :disabled="!isDirty"
                color="primary"
                @click="save"
              >
                Save
              </UButton>
              <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
              <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            </div>
          </div>
        </div>

        <aside class="stage-panel-dark stage-grid-board p-5 sm:p-6">
          <span class="stage-overline text-[var(--stage-cream)]">What this controls</span>
          <h2 class="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--stage-cream)]">
            Make it easy to recognize you.
          </h2>
          <div class="mt-4 space-y-4 text-sm leading-6 text-[rgba(251,247,239,0.82)]">
            <p>
              Display name, city, pronouns, and bio help theaters and collaborators
              recognize you without guessing.
            </p>
            <p>
              Visibility determines how widely your details appear across the
              network, while timezone keeps scheduling readable for everyone else.
            </p>
          </div>
        </aside>
      </section>
    </StageSection>
  </div>
</template>
