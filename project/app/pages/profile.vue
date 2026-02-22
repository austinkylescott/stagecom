<script setup lang="ts">
const supabase = useSupabaseClient();
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

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id: user.value.id,
    display_name: form.displayName,
    avatar_url: form.avatarUrl || null,
    timezone: form.timezone || "UTC",
    pronouns: form.pronouns || null,
    bio: form.bio || null,
    city: form.city || null,
    visibility: form.visibility || "theater_only",
  });

  if (upsertError) {
    error.value = upsertError.message;
  } else {
    notice.value = "Profile updated";
    refreshProfile();
    initial.displayName = form.displayName;
    initial.avatarUrl = form.avatarUrl;
    initial.timezone = form.timezone;
    initial.pronouns = form.pronouns;
    initial.bio = form.bio;
    initial.city = form.city;
    initial.visibility = form.visibility;
  }
  loading.value = false;
};
</script>

<template>
  <div class="space-y-6 max-w-xl">
    <div>
      <h1 class="text-2xl font-semibold">Profile</h1>
      <p>Update how you appear to theaters and performers.</p>
    </div>

    <UAlert v-if="!user" color="yellow" variant="soft">
      <template #title>Sign in required</template>
      <template #description>Log in to edit your profile.</template>
    </UAlert>

    <UCard v-else>
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

        <div class="flex items-center gap-2">
          <UButton
            :loading="loading"
            :disabled="!isDirty"
            color="primary"
            @click="save"
            >Save</UButton
          >
          <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
