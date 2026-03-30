<script setup lang="ts">
import StageFeatureCard from "~/components/StageFeatureCard.vue";
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
  <StageFeatureCard
    :title="theater.name"
    :subtitle="formatLocation(theater)"
    tone="bg-[var(--stage-theater)]"
  >
    <div class="space-y-4 text-[var(--stage-ink)]">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="isHome"
          class="stage-chip bg-[var(--stage-theater)] text-[var(--stage-ink)]"
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
      <p v-if="theater.tagline" class="text-sm leading-6 stage-muted">
        {{ theater.tagline }}
      </p>
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
  </StageFeatureCard>
</template>
