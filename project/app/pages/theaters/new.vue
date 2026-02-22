<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import type { FetchError } from "ofetch";
import { queryKeys } from "~/composables/queryKeys";

const router = useRouter();

const form = reactive({
  name: "",
  tagline: "",
  street: "",
  city: "",
  state_region: "",
  postal_code: "",
  country: "",
});

const slugPreview = computed(() => {
  const base = form.name
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "will-be-generated";
});

const loading = ref(false);
const error = ref("");
const notice = ref("");

type TheaterResponse = { id: string; slug: string };

const queryCache = useQueryCache();
const createTheater = useMutation<TheaterResponse, typeof form>({
  mutation: (payload) =>
    $fetch<TheaterResponse>("/api/theaters", {
      method: "POST",
      body: { ...payload },
      credentials: "include",
    }),
  onSuccess: async (theater) => {
    notice.value = "Theater created";
    await Promise.all([
      queryCache.invalidateQueries({ key: queryKeys.theaters(), exact: false }),
      queryCache.invalidateQueries({
        key: queryKeys.homeTheater(),
        exact: true,
      }),
    ]);
    await router.push(`/theaters/${theater.slug}/shows/new`);
  },
  onError: (e: any) => {
    const err = e as FetchError<any>;
    error.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Failed to create theater";
  },
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  try {
    await createTheater.mutateAsync(form);
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

          <UFormField label="Slug" description="Auto-assigned; editable later">
            <UInput :model-value="slugPreview" disabled />
          </UFormField>

          <UFormField label="Tagline" description="Short promo blurb">
            <UInput
              v-model="form.tagline"
              placeholder="Late-night improv hub"
            />
          </UFormField>

          <UFormField label="Street address">
            <UInput v-model="form.street" placeholder="123 Main St" />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="City">
              <UInput v-model="form.city" placeholder="Chicago" />
            </UFormField>
            <UFormField label="State/Region">
              <UInput v-model="form.state_region" placeholder="IL" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="Postal code">
              <UInput v-model="form.postal_code" placeholder="60601" />
            </UFormField>
            <UFormField label="Country">
              <UInput v-model="form.country" placeholder="USA" />
            </UFormField>
          </div>

          <div class="flex gap-2 items-center">
            <UButton :loading="loading" color="primary" @click="handleSubmit">
              Create theater
            </UButton>
            <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </UForm>
        <p class="text-sm text-slate-600">
          Creator becomes admin automatically.
        </p>
      </div>
    </UCard>
  </div>
</template>
