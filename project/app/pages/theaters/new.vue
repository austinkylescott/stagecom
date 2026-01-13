<script setup lang="ts">
import type { FetchError } from "ofetch";

const router = useRouter();

const form = reactive({
  name: "",
  slug: "",
  timezone: "America/New_York",
});

const loading = ref(false);
const error = ref("");
const notice = ref("");

type TheaterResponse = { id: string; slug: string };

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  try {
    const theater = await $fetch<TheaterResponse>("/api/theaters", {
      method: "POST",
      // ✅ pass the object; $fetch will JSON-encode it
      body: { ...form },
      // ✅ include if your /api route relies on cookies/session
      credentials: "include",
    });

    notice.value = "Theater created";
    await router.push(`/theaters/${theater.slug}/shows/new`);
  } catch (e) {
    const err = e as FetchError<any>;
    error.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Failed to create theater";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Create a theater</h1>
    <UCard>
      <div class="space-y-4">
        <UForm>
          <UFormField label="Name">
            <UInput v-model="form.name" placeholder="Bright Comedy" />
          </UFormField>

          <UFormField label="Slug" description="Used in URLs">
            <UInput v-model="form.slug" placeholder="bright-comedy" />
          </UFormField>

          <UFormField label="Timezone">
            <UInput v-model="form.timezone" placeholder="America/New_York" />
          </UFormField>

          <div class="flex gap-2 items-center">
            <UButton :loading="loading" color="primary" @click="handleSubmit">
              Create theater
            </UButton>
            <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </UForm>
        <p class="text-sm text-slate-600">
          Creator becomes manager automatically.
        </p>
      </div>
    </UCard>
  </div>
</template>
