<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Keep the reactive profile in sync with the canonical row we control.
const { profile, profilePending, profileError, refreshProfile } =
  useUserIdentity();

const form = reactive({
  displayName: "",
  avatarUrl: "",
  timezone: "UTC",
});

const initial = reactive({
  displayName: "",
  avatarUrl: "",
  timezone: "UTC",
});

const loading = ref(false);
const notice = ref("");
const error = ref("");
const hydrated = ref(false);

watch(
  () => [user.value?.id, profile.value],
  () => {
    if (!user.value) return;

    // Populate form from the latest profile/user data.
    const data = profile.value;
    form.displayName = data?.display_name || user.value.email || "";
    form.avatarUrl = data?.avatar_url || "";
    form.timezone = data?.timezone || "UTC";

    // Capture a clean baseline for dirty checking.
    initial.displayName = form.displayName;
    initial.avatarUrl = form.avatarUrl;
    initial.timezone = form.timezone;
    hydrated.value = true;
  },
  { immediate: true },
);

const isDirty = computed(
  () =>
    form.displayName !== initial.displayName ||
    form.avatarUrl !== initial.avatarUrl ||
    form.timezone !== initial.timezone,
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
  });

  if (upsertError) {
    error.value = upsertError.message;
  } else {
    notice.value = "Profile updated";
    refreshProfile();
    initial.displayName = form.displayName;
    initial.avatarUrl = form.avatarUrl;
    initial.timezone = form.timezone;
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

        <UFormField
          label="Timezone"
          description="IANA name, e.g. America/New_York"
        >
          <UInput v-model="form.timezone" placeholder="UTC" />
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
