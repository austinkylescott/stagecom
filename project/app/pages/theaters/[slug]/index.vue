<script setup lang="ts">
import { useRequestHeaders } from "#app";
import { useLocationFormatter } from "~/composables/useLocationFormatter";
import TheaterFollowHomeButtons from "~/components/TheaterFollowHomeButtons.vue";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import {
  type TheaterDetails,
  useTheaterDetails,
} from "~/composables/useTheaterDetails";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { formatLocation } = useLocationFormatter();
const { homeId } = useHomeTheaterState();

// Fetch once during SSR so the first paint already has theater data.
const { data: initialTheater } = await useAsyncData(
  () =>
    $fetch<TheaterDetails>(`/api/theaters/${slug.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, isLoading, error } = useTheaterDetails(slug, initialTheater);

const theater = computed(() => data.value?.theater || null);
const membership = computed(() => data.value?.membership || null);
const isMember = computed(() => membership.value?.status === "active");
const isHome = computed(
  () => membership.value?.isHome || homeId.value === theater.value?.id || false,
);
const canReview = computed(() => data.value?.permissions?.canReview ?? false);
</script>

<template>
  <div class="space-y-8">
    <UCard>
      <div
        class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
      >
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold">{{ theater?.name || slug }}</h1>
          <p v-if="theater?.tagline" class="text-slate-700">
            {{ theater.tagline }}
          </p>
          <p class="text-sm text-slate-600">
            {{ formatLocation(theater || undefined) }}
          </p>
          <div class="flex gap-3 flex-wrap text-xs text-slate-600">
            <span class="inline-flex items-center gap-1">
              <UIcon name="i-heroicons-user-group" />
              {{ data?.stats.memberCount ?? 0 }} members
            </span>
            <span class="inline-flex items-center gap-1">
              <UIcon name="i-heroicons-ticket" />
              {{ data?.stats.totalShows ?? 0 }} shows
            </span>
            <span
              v-if="canReview"
              class="inline-flex items-center gap-1 text-orange-700"
            >
              <UIcon name="i-heroicons-inbox-stack" />
              {{ data?.stats.pendingReviewCount ?? 0 }} pending review
            </span>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap">
          <TheaterFollowHomeButtons
            v-if="theater"
            :theater="theater"
            :is-member="isMember"
            :is-home="isHome"
            size="sm"
          />
          <UButton
            v-if="canReview"
            size="sm"
            color="orange"
            :to="`/theaters/${slug}/review`"
            icon="i-heroicons-inbox-stack"
          >
            Review queue
          </UButton>
          <UButton
            v-if="isMember"
            size="sm"
            color="emerald"
            :to="`/theaters/${slug}/shows/new`"
            icon="i-heroicons-plus"
          >
            New show
          </UButton>
        </div>
      </div>
    </UCard>

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p class="text-lg font-semibold">Public shows</p>
          <p class="text-sm text-slate-600">
            Approved and publicly listed shows with their next occurrence.
          </p>
        </div>
        <p v-if="isLoading" class="text-sm text-slate-600">Loading…</p>
      </div>

      <div
        v-if="!isLoading && data?.shows.public?.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <UCard v-for="show in data?.shows.public" :key="show.id" class="h-full">
          <h3 class="text-lg font-semibold">{{ show.title }}</h3>
          <p v-if="show.description" class="text-slate-600 text-sm mt-1">
            {{ show.description }}
          </p>
          <p class="text-sm text-slate-700 mt-2">
            Next:
            {{
              show.startsAt ? new Date(show.startsAt).toLocaleString() : "TBD"
            }}
          </p>
        </UCard>
      </div>
      <div v-else-if="!isLoading" class="text-sm text-slate-600">
        No public shows yet.
      </div>
    </section>
  </div>
</template>
