<script setup lang="ts">
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data, pending, error } = useAsyncData(
  () =>
    $fetch<{
      theater?: {
        name: string;
        tagline: string | null;
        street: string | null;
        city: string | null;
        state_region: string | null;
        postal_code: string | null;
        country: string | null;
      };
      shows: {
        id: string;
        title: string;
        startsAt: string | null;
        description: string | null;
      }[];
    }>(`/api/theaters/${slug.value}/public`),
  { watch: [slug] },
);

const theater = computed(() => data.value?.theater || null);

const formatLocation = computed(() => {
  if (!theater.value) return "";
  const cityStateCountry = [
    theater.value.city,
    theater.value.state_region,
    theater.value.country,
  ]
    .filter(Boolean)
    .join(", ");
  const streetLine = [theater.value.street, theater.value.postal_code]
    .filter(Boolean)
    .join(" ");
  return [cityStateCountry, streetLine].filter(Boolean).join(" • ");
});
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h1 class="text-2xl font-semibold">
        {{ theater?.name || slug }}
      </h1>
      <p v-if="theater?.tagline" class="text-slate-700">
        {{ theater.tagline }}
      </p>
      <p class="text-sm text-slate-600">
        {{ formatLocation || "Location TBD" }}
      </p>
    </div>
    <p class="text-slate-600">
      Approved + public shows with their next occurrence.
    </p>
    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>
    <div class="grid gap-4 md:grid-cols-2" v-if="!pending">
      <UCard v-for="show in data?.shows || []" :key="show.id">
        <h3 class="text-lg font-semibold">{{ show.title }}</h3>
        <p class="text-slate-600 text-sm mt-1">{{ show.description }}</p>
        <p class="text-sm text-slate-700 mt-2">
          Next:
          {{ show.startsAt ? new Date(show.startsAt).toLocaleString() : "TBD" }}
        </p>
      </UCard>
    </div>
    <p v-else class="text-sm text-slate-600">Loading shows...</p>
  </div>
</template>
