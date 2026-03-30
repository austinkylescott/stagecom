<script setup lang="ts">
import { useLocationFormatter } from "~/composables/useLocationFormatter";
import TheaterFollowHomeButtons from "~/components/TheaterFollowHomeButtons.vue";

type Theater = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
};

const props = defineProps<{
  theater: Theater;
  isMember?: boolean;
  isHome?: boolean;
  primaryLabel?: string;
  primaryTo?: string;
  showFollow?: boolean;
  loading?: boolean; // membership action loading (legacy)
  homeLoading?: boolean; // legacy
}>();

const emit = defineEmits<{
  (e: "toggle", action: "join" | "leave", theater: Theater): void;
  (e: "home", action: "set" | "clear", theater: Theater): void;
  (
    e: "membership-changed",
    payload: { theaterId: string; isMember: boolean; isHome: boolean },
  ): void;
}>();

const { formatLocation } = useLocationFormatter();
</script>

<template>
  <div
    class="stage-list-card flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between"
  >
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="isHome"
          class="stage-chip bg-[var(--stage-mint)] text-[var(--stage-ink)]"
        >
          Home theater
        </span>
        <span
          v-else-if="isMember"
          class="stage-chip bg-[var(--stage-paper-strong)] text-[var(--stage-ink)]"
        >
          Following
        </span>
      </div>
      <p class="font-display text-3xl uppercase tracking-[0.08em]">
        {{ theater.name }}
      </p>
      <p class="text-xs stage-overline stage-muted">
        {{ formatLocation(theater) }}
      </p>
      <p v-if="theater.tagline" class="max-w-xl text-sm leading-6 stage-muted">
        {{ theater.tagline }}
      </p>
    </div>
    <div class="flex flex-wrap gap-2 items-center">
      <UButton size="xs" :to="primaryTo || `/theaters/${theater.slug}`">
        {{ primaryLabel || "View" }}
      </UButton>
      <TheaterFollowHomeButtons
        v-if="showFollow"
        :theater="theater"
        :is-member="isMember"
        :is-home="isHome"
        size="xs"
        @updated="(p) => emit('membership-changed', p)"
      />
    </div>
  </div>
</template>
