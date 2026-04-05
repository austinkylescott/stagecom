<script setup lang="ts">
import type { TheaterDetails } from "~/queries/theaters";
import { getTheaterInitials } from "~/utils/theaterPresentation";

const props = defineProps<{
  slug: string;
  theater: TheaterDetails["theater"] | null;
  canReview: boolean;
  passiveRelationshipLabel: string | null;
  fullAddress: string;
}>();

const dashboardLabel = computed(
  () => props.passiveRelationshipLabel ?? "Theater dashboard",
);

const theaterInitials = computed(() => getTheaterInitials(props.theater?.name));
</script>

<template>
  <div class="grid gap-5 lg:gap-6 *:min-w-0">
    <div class="border-b-2 border-stage-ink/15 pb-4">
      <p
        class="text-xs font-semibold uppercase tracking-[0.14em] text-stage-ink/60"
      >
        {{ dashboardLabel }}
      </p>
    </div>

    <div class="grid gap-4">
      <div class="min-w-0">
        <div class="flex min-w-0 items-center gap-4 sm:gap-5">
          <UAvatar
            :text="theaterInitials"
            class="size-20 shrink-0 border-2 border-(--stage-ink) bg-stage-surface-chip text-xl font-black text-(--stage-ink) sm:size-24 sm:text-2xl"
          />

          <div class="min-w-0 flex-1 space-y-2">
            <h1
              class="wrap-break-word font-display text-[clamp(2.7rem,11vw,7rem)] uppercase leading-[0.88] tracking-[0.03em] text-(--stage-ink)"
            >
              {{ theater?.name || slug }}
            </h1>

            <p
              v-if="canReview"
              class="text-xs font-semibold uppercase tracking-[0.14em] text-stage-ink/60"
            >
              Oversight access
            </p>
          </div>
        </div>

        <p
          v-if="theater?.tagline"
          class="min-w-0 text-lg leading-8 text-stage-ink/80"
        >
          {{ theater.tagline }}
        </p>
        <p class="min-w-0 text-sm leading-7 text-stage-ink/70">
          {{ fullAddress }}
        </p>
      </div>
    </div>
  </div>
</template>
