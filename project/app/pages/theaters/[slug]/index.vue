<script setup lang="ts">
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data, pending, error } = useAsyncData(
  () =>
    $fetch<{
      shows: {
        id: string;
        title: string;
        startsAt: string | null;
        description: string | null;
      }[];
    }>(`/api/theaters/${slug.value}/public`),
  { watch: [slug] },
);
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold">Theater shows</h1>
      <p class="text-slate-600">
        Approved + public shows with their next occurrence.
      </p>
    </div>
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
