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
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] stage-texture overflow-hidden" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span class="stage-kicker">Performer discovery</span>
          <h1 class="mt-4 stage-section-title">Find people across your scene.</h1>
          <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
            Search by name, scan shared-theater context, and quickly understand who is already part of your working community.
          </p>
        </div>
        <UButton icon="i-heroicons-arrow-path" variant="ghost" @click="refresh">
          Refresh
        </UButton>
      </div>
      <div class="mt-5 max-w-md">
        <UInput
          v-model="searchInput"
          placeholder="Search performers by name"
          icon="i-heroicons-magnifying-glass"
        />
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.52)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div v-if="error" class="mb-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.message || error?.data?.message }}
      </div>

      <div v-if="isLoading" class="stage-panel px-5 py-6 text-sm stage-muted">
        Loading performers...
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PerformerDirectoryRow
          v-for="performer in performers"
          :key="performer.id"
          :performer="performer"
          :shared-theater-count="sharedCounts.get(performer.id) || 0"
        />
        <p v-if="!performers.length" class="stage-panel px-5 py-6 text-sm stage-muted sm:col-span-2 lg:col-span-3">
          No performers match that search yet.
        </p>
      </div>

      <div class="pt-6">
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

      <div class="pt-6 text-xs stage-muted">
        Shared theater membership is the current proxy for community overlap, so use it as context rather than a hard ranking of collaboration history.
      </div>
    </StageSection>
  </div>
</template>
