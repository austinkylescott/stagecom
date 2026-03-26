<script setup lang="ts">
import { useRequestHeaders } from "#app";
import { useShowDetail, type ShowDetailResponse } from "~/composables/useShowDetail";
import ShowCastPanel from "~/components/ShowCastPanel.vue";

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const id = computed(() => route.params.id as string);

const { data: initialData } = await useAsyncData(
  () =>
    $fetch<ShowDetailResponse>(`/api/shows/${id.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, isLoading, error, refresh } = useShowDetail(id, initialData);
const user = useSupabaseUser();
const hasRefreshedAuthedDetail = ref(false);
const authDetailResolved = ref(import.meta.server);

watch(
  () => user.value?.id,
  async (userId) => {
    if (!import.meta.client) {
      return;
    }

    if (!userId) {
      authDetailResolved.value = true;
      return;
    }

    if (hasRefreshedAuthedDetail.value) {
      return;
    }

    hasRefreshedAuthedDetail.value = true;
    authDetailResolved.value = false;

    try {
      await refresh();
    } finally {
      authDetailResolved.value = true;
    }
  },
  { immediate: true },
);

const show = computed(() => data.value?.show ?? null);
const occurrences = computed(() => data.value?.occurrences ?? []);
const producers = computed(() => data.value?.producers ?? []);
const cast = computed(() => data.value?.cast ?? []);
const viewerCast = computed(() => data.value?.viewerCast ?? null);
const isProducer = computed(() => data.value?.permissions.isProducer ?? false);
const canSeePendingCast = computed(
  () => data.value?.permissions.canSeePendingCast ?? false,
);

const statusColors = {
  draft: "gray",
  pending_review: "orange",
  approved: "emerald",
  rejected: "red",
  cancelled: "gray",
} as const;
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div class="flex items-center gap-2 text-sm text-slate-500">
      <NuxtLink :to="`/theaters/${slug}`" class="hover:underline">
        {{ show?.theaterName ?? slug }}
      </NuxtLink>
      <span>/</span>
      <span>{{ show?.title ?? "Show" }}</span>
    </div>

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>

    <div v-if="isLoading && !show" class="text-sm text-slate-500">
      Loading...
    </div>

    <UCard v-if="show">
      <template #header>
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold">{{ show.title }}</h1>
            <p class="text-xs uppercase tracking-wide text-slate-500">
              {{ show.eventType }}
            </p>
          </div>
          <UBadge :color="statusColors[show.status]" variant="soft">
            {{ show.status }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-4">
        <p v-if="show.description" class="text-slate-700">
          {{ show.description }}
        </p>
        <div class="grid gap-2 sm:grid-cols-2 text-sm">
          <div v-if="show.castMin || show.castMax">
            <span class="text-slate-500">Cast size: </span>
            <span>{{ show.castMin ?? "?" }}–{{ show.castMax ?? "?" }}</span>
          </div>
          <div v-if="show.ticketUrl">
            <span class="text-slate-500">Tickets: </span>
            <a
              :href="show.ticketUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              Link
            </a>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="show">
      <template #header>
        <p class="font-semibold">Schedule</p>
      </template>
      <div v-if="!occurrences.length" class="text-sm text-slate-500">
        No occurrences scheduled yet.
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="occ in occurrences"
          :key="occ.id"
          class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
        >
          <span>{{ new Date(occ.starts_at).toLocaleString() }}</span>
          <div class="flex items-center gap-2">
            <span v-if="occ.ends_at" class="text-slate-500">
              → {{ new Date(occ.ends_at).toLocaleString() }}
            </span>
            <UBadge
              v-if="occ.status !== 'scheduled'"
              size="xs"
              color="orange"
              variant="soft"
            >
              {{ occ.status }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="show">
      <template #header>
        <p class="font-semibold">Cast</p>
      </template>
      <ShowCastPanel
        v-if="data"
        :show-id="show.id"
        :theater-id="show.theaterId"
        :theater-slug="show.theaterSlug ?? ''"
        :producers="producers"
        :cast="cast"
        :viewer-cast="viewerCast"
        :is-producer="isProducer"
        :can-request-to-join="data.permissions.canRequestToJoin"
        :can-see-pending-cast="canSeePendingCast"
        :viewer-cast-resolved="authDetailResolved"
        :refresh-show="refresh"
      />
    </UCard>
  </div>
</template>
