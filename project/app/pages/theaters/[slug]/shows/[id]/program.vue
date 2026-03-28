<script setup lang="ts">
import { useRequestHeaders } from "#app";
import {
  useShowDetail,
  type ShowDetailResponse,
} from "~/composables/useShowDetail";

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

const { data, isLoading, error } = useShowDetail(id, initialData);

const show = computed(() => data.value?.show ?? null);
const acceptedCast = computed(() =>
  (data.value?.cast ?? [])
    .filter((member) => member.status === "accepted")
    .slice()
    .sort((a, b) => {
      if (a.programOrder === null && b.programOrder === null) {
        return (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);
      }

      if (a.programOrder === null) return 1;
      if (b.programOrder === null) return -1;
      if (a.programOrder !== b.programOrder) {
        return a.programOrder - b.programOrder;
      }

      return (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);
    }),
);
const nextOccurrence = computed(() => data.value?.occurrences?.[0] ?? null);
</script>

<template>
  <div class="mx-auto max-w-xl space-y-6">
    <div class="space-y-2">
      <NuxtLink
        :to="`/theaters/${slug}/shows/${id}`"
        class="text-sm text-slate-500 hover:text-slate-700"
      >
        Back to show
      </NuxtLink>
      <div v-if="show" class="space-y-1">
        <p class="text-xs uppercase tracking-[0.24em] text-slate-500">
          Program
        </p>
        <h1 class="text-3xl font-semibold text-slate-900">{{ show.title }}</h1>
        <p class="text-sm text-slate-600">
          {{ show.theaterName }}
        </p>
      </div>
    </div>

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>

    <div v-if="isLoading && !show" class="text-sm text-slate-500">
      Loading...
    </div>

    <UCard v-if="show">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-slate-700">
            {{ acceptedCast.length }} performer{{ acceptedCast.length === 1 ? "" : "s" }}
          </p>
          <p v-if="nextOccurrence" class="text-sm text-slate-500">
            {{ new Date(nextOccurrence.starts_at).toLocaleString() }}
          </p>
        </div>
        <UBadge v-if="show.isCastFinalized" color="primary" variant="soft">
          Finalized
        </UBadge>
      </div>
    </UCard>

    <div
      v-if="show"
      class="space-y-3"
    >
      <div
        v-for="(member, index) in acceptedCast"
        :key="member.userId"
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {{ member.programOrder ?? index + 1 }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-base font-semibold text-slate-900">
              {{ member.displayName ?? member.userId }}
            </p>
            <p class="text-xs uppercase tracking-wide text-slate-500">
              {{ member.programOrder ? `Program slot ${member.programOrder}` : "Performer" }}
            </p>
          </div>
        </div>
      </div>

      <UCard v-if="acceptedCast.length === 0">
        <p class="text-sm text-slate-500">
          No accepted performers are in the program yet.
        </p>
      </UCard>
    </div>
  </div>
</template>
