<script setup lang="ts">
import type { HomeTheater } from "~/queries/home";

defineProps<{
  theaters: HomeTheater[];
  title: string;
  description: string;
}>();

const emit = defineEmits<{
  (e: "add-home", theaterId: string): void;
}>();

const formatLocation = (theater: HomeTheater) =>
  [theater.city, theater.state_region, theater.country].filter(Boolean).join(", ");
</script>

<template>
  <UCard
    :ui="{
      root: 'rounded-none border-3 border-(--stage-ink) bg-[rgba(251,247,239,0.92)]',
      header: 'p-5 sm:p-6',
      body: 'p-5 pt-0 sm:p-6 sm:pt-0',
    }"
  >
    <template #header>
      <div>
        <p class="stage-overline">Eligible theaters</p>
        <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
          {{ title }}
        </h2>
        <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
          {{ description }}
        </p>
      </div>
    </template>

    <div
      v-if="!theaters.length"
      class="border-2 border-dashed border-(--stage-ink) bg-[rgba(251,247,239,0.74)] px-4 py-6 text-sm stage-muted"
    >
      No additional member theaters are available for home-theater pinning right now.
    </div>

    <div v-else class="grid gap-3 xl:grid-cols-2">
      <article
        v-for="theater in theaters"
        :key="theater.id"
        class="border-2 border-(--stage-ink) bg-[rgba(130,191,182,0.16)] p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="font-display text-3xl uppercase tracking-[0.06em] text-(--stage-ink)">
              {{ theater.name }}
            </h3>
            <p class="mt-2 text-sm stage-muted">
              {{ formatLocation(theater) || "Location not listed yet." }}
            </p>
            <p v-if="theater.tagline" class="mt-2 text-sm leading-6 text-[rgba(43,41,38,0.82)]">
              {{ theater.tagline }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <StageButton variant="ghost" tone="theater" :to="`/theaters/${theater.slug}`">
              Open theater
            </StageButton>
            <StageButton
              variant="ghost"
              tone="performer"
              icon="i-heroicons-home"
              @click="emit('add-home', theater.id)"
            >
              Add home
            </StageButton>
          </div>
        </div>
      </article>
    </div>
  </UCard>
</template>
