<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { PerformersResponse } from "~/queries/people";

type Membership = PerformersResponse["memberships"][number];

const user = useSupabaseUser();
const searchInput = ref("");
const search = ref("");
const page = ref(1);

watchDebounced(
  searchInput,
  (value) => {
    search.value = value.trim();
    page.value = 1;
  },
  { debounce: 300, maxWait: 800 },
);

const { data, isLoading, error, refresh } = usePerformers({
  search,
  page,
  pageSize: 24,
});

const performers = computed(() => data.value?.profiles ?? []);

const sharedCounts = computed(() => {
  const myId = user.value?.id;
  const map = new Map<string, number>();
  const memberships = data.value?.memberships || [];

  const byUser = memberships.reduce((acc: Map<string, Set<string>>, m: Membership) => {
    const set = acc.get(m.user_id) || new Set<string>();
    set.add(m.theater_id);
    acc.set(m.user_id, set);
    return acc;
  }, new Map());

  const myTheaters = byUser.get(myId || "") || new Set<string>();

  for (const [uid, theaters] of byUser.entries()) {
    if (!myId || uid === myId) continue;
    const overlap = [...theaters].filter((t) => myTheaters.has(t)).length;
    map.set(uid, overlap);
  }

  return map;
});
const totalPages = computed(() => data.value?.totalPages ?? 1);
const showPagination = computed(() => totalPages.value > 1);
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Performers</h1>
        <p class="text-slate-600">
          Discover performers, see who you share stages with, and invite new
          voices.
        </p>
      </div>
      <UButton icon="i-heroicons-arrow-path" variant="ghost" @click="refresh"
        >Refresh</UButton
      >
    </div>

    <UInput
      v-model="searchInput"
      placeholder="Search performers by name"
      icon="i-heroicons-magnifying-glass"
      class="max-w-md"
    />

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.message || error?.data?.message }}
    </div>

    <div v-if="isLoading" class="text-sm text-slate-600">
      Loading performers...
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PerformerDirectoryRow
        v-for="performer in performers"
        :key="performer.id"
        :performer="performer"
        :shared-theater-count="sharedCounts.get(performer.id) || 0"
      />
      <p v-if="!performers.length" class="text-sm text-slate-500">
        No performers match that search yet.
      </p>
    </div>

    <div class="pt-2">
      <UPagination
        v-if="showPagination"
        :page="page"
        :total="totalPages"
        :items-per-page="1"
        :disabled="isLoading"
        :show-controls="true"
        @update:page="(p) => (page = p)"
      />
    </div>

    <div class="text-xs text-slate-500">
      Social clustering v1 uses shared theater membership as a proxy for “play
      together”. We can extend this to co-cast counts when cast data lands.
    </div>
  </div>
</template>
