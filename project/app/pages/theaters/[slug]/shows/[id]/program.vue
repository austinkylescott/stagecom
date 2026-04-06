<script setup lang="ts">
import { useRequestHeaders } from "#app";
import StageFeatureCard from "~/components/StageFeatureCard.vue";
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
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden"
      inner-class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div class="stage-page-grid stage-page-grid-rail items-start">
        <div class="space-y-4">
          <NuxtLink
            :to="`/theaters/${slug}/shows/${id}`"
            class="stage-link text-sm"
          >
            Back to show
          </NuxtLink>

          <div v-if="show" class="space-y-2">
            <span class="stage-kicker">Program view</span>
            <div>
              <h1 class="stage-section-title">{{ show.title }}</h1>
              <p class="mt-3 max-w-2xl text-lg leading-8 stage-muted">
                Keep the lineup readable and dependable for performers, producers, and anyone building a show-night program.
              </p>
            </div>
          </div>
        </div>

        <aside v-if="show" class="stage-panel-dark stage-grid-board p-5 sm:p-6">
          <p class="stage-overline text-(--stage-paper-muted)">Program snapshot</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-(--stage-cream)">
            {{ acceptedCast.length }} performer{{ acceptedCast.length === 1 ? "" : "s" }}
          </h2>
          <p class="mt-4 text-sm leading-7 text-(--stage-paper-muted)">
            {{ show.theaterName }}
          </p>
          <p v-if="nextOccurrence" class="mt-2 text-sm leading-7 text-(--stage-paper-muted)">
            {{ new Date(nextOccurrence.starts_at).toLocaleString() }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <UBadge v-if="show.isCastFinalized" color="error" variant="soft">
              Finalized
            </UBadge>
            <UBadge color="error" variant="soft">
              Program order
            </UBadge>
          </div>
        </aside>
      </div>
    </StageSection>

    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.52)]"
      inner-class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div v-if="error" class="mb-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>

      <div v-if="isLoading && !show" class="stage-panel px-5 py-6 text-sm stage-muted">
        Loading program…
      </div>

      <div v-if="show" class="space-y-6">
        <StageFeatureCard
          title="Lineup Order"
          subtitle="Program everyone can trust"
          tone="bg-(--stage-coral)"
        >
          <div class="flex items-center justify-between gap-3 p-4">
            <div>
              <p class="text-sm font-medium text-(--stage-ink)">
                {{ acceptedCast.length }} performer{{ acceptedCast.length === 1 ? "" : "s" }}
              </p>
              <p v-if="nextOccurrence" class="text-sm stage-muted">
                {{ new Date(nextOccurrence.starts_at).toLocaleString() }}
              </p>
            </div>
            <UBadge v-if="show.isCastFinalized" color="error" variant="soft">
              Finalized
            </UBadge>
          </div>
        </StageFeatureCard>

        <div class="space-y-3">
          <div
            v-for="(member, index) in acceptedCast"
            :key="member.userId"
            class="stage-list-card px-4 py-4"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-ink) text-sm font-semibold text-(--stage-cream)">
                {{ member.programOrder ?? index + 1 }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-base font-semibold text-(--stage-ink)">
                  {{ member.displayName ?? member.userId }}
                </p>
                <p class="text-xs uppercase tracking-wide stage-muted">
                  {{ member.programOrder ? `Program slot ${member.programOrder}` : "Performer" }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="acceptedCast.length === 0" class="stage-panel px-4 py-5">
            <p class="text-sm stage-muted">
              No accepted performers are in the program yet.
            </p>
          </div>
        </div>
      </div>
    </StageSection>
  </div>
</template>
