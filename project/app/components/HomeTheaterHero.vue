<script setup lang="ts">
import { useLocationFormatter } from "~/composables/useLocationFormatter";

const props = withDefaults(
  defineProps<{
    theater?: {
      id: string;
      name: string;
      slug: string;
      tagline?: string | null;
      city?: string | null;
      state_region?: string | null;
      country?: string | null;
    } | null;
    shows?: {
      id: string;
      title: string;
      startsAt: string | null;
      description?: string | null;
    }[];
    candidates?: {
      id: string;
      name: string;
      slug: string;
      tagline?: string | null;
      city?: string | null;
      state_region?: string | null;
      country?: string | null;
    }[];
    onSetHome?: (theaterId: string | null) => Promise<void> | void;
  }>(),
  {
    theater: null,
    shows: () => [],
    candidates: () => [],
  },
);

const { formatLocation } = useLocationFormatter();
</script>

<template>
  <section
    class="stage-panel-dark stage-grid-board overflow-hidden p-6 sm:p-8"
  >
    <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div class="space-y-5">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="space-y-2">
            <p class="stage-overline text-[var(--stage-paper-muted)]">
              Home theater
            </p>
            <h2 class="font-display text-5xl uppercase tracking-[0.1em]">
              {{ theater?.name || "Choose a home theater" }}
            </h2>
            <p
              v-if="theater?.tagline"
              class="max-w-2xl text-base leading-7 text-[var(--stage-paper-muted)]"
            >
              {{ theater.tagline }}
            </p>
            <p class="text-sm text-[var(--stage-paper-muted)]">
              {{ theater ? formatLocation(theater) : "No default theater set." }}
            </p>
          </div>

          <div class="flex gap-2 flex-wrap self-start">
            <UButton
              v-if="theater"
              size="xs"
              :to="`/theaters/${theater.slug}`"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              Open
            </UButton>
            <UButton
              v-if="theater && onSetHome"
              size="xs"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="onSetHome(null)"
            >
              Clear home
            </UButton>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div
            class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
          >
            <p class="stage-overline text-[var(--stage-paper-muted)]">Status</p>
            <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
              {{ theater ? "Active hub" : "Unset" }}
            </p>
          </div>
          <div
            class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
          >
            <p class="stage-overline text-[var(--stage-paper-muted)]">
              Upcoming
            </p>
            <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
              {{ shows?.length || 0 }} shows
            </p>
          </div>
          <div
            class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
          >
            <p class="stage-overline text-[var(--stage-paper-muted)]">
              Community
            </p>
            <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
              {{ candidates?.length || 0 }} options
            </p>
          </div>
        </div>
      </div>

      <div class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-5">
        <div class="flex items-center justify-between gap-3">
          <p class="stage-overline text-[var(--stage-paper-muted)]">
            Upcoming shows
          </p>
          <NuxtLink
            v-if="theater"
            :to="`/theaters/${theater.slug}`"
            class="stage-link text-sm text-[var(--stage-paper)]"
          >
            See all
          </NuxtLink>
        </div>
        <div class="mt-4 space-y-3">
          <NuxtLink
            v-for="show in shows"
            :key="show.id"
            :to="theater ? `/theaters/${theater.slug}/shows/${show.id}` : undefined"
            class="block border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.12)] p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-[var(--stage-cream)]">{{ show.title }}</p>
                <p class="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--stage-paper-muted)]">
                  {{
                    show.startsAt ? new Date(show.startsAt).toLocaleString() : "TBD"
                  }}
                </p>
              </div>
              <span class="stage-chip bg-[var(--stage-gold)] text-[var(--stage-ink)]">
                Show
              </span>
            </div>
            <p
              v-if="show.description"
              class="mt-3 text-sm leading-6 text-[var(--stage-paper-muted)] line-clamp-2"
            >
              {{ show.description }}
            </p>
          </NuxtLink>
          <p v-if="!shows?.length" class="text-sm text-[var(--stage-paper-muted)]">
            No upcoming shows yet.
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="!theater && candidates?.length"
      class="mt-6 border-t-3 border-[rgba(239,227,205,0.5)] pt-6"
    >
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="stage-overline text-[var(--stage-paper-muted)]">
            Set a home theater
          </p>
          <h3 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Pick your home base
          </h3>
        </div>
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-3">
        <article
          v-for="c in candidates"
          :key="c.id"
          class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
        >
          <div>
            <p class="font-display text-3xl uppercase tracking-[0.08em]">
              {{ c.name }}
            </p>
            <p class="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--stage-paper-muted)]">
              {{ formatLocation(c) }}
            </p>
            <p
              v-if="c.tagline"
              class="mt-3 text-sm leading-6 text-[var(--stage-paper-muted)] line-clamp-2"
            >
              {{ c.tagline }}
            </p>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <UButton
              size="xs"
              :to="`/theaters/${c.slug}`"
              variant="ghost"
            >
              Open
            </UButton>
            <UButton
              size="xs"
              icon="i-heroicons-home"
              :disabled="!onSetHome"
              @click="onSetHome?.(c.id)"
            >
              Make home
            </UButton>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
