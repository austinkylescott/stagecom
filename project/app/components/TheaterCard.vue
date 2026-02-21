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
    class="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
  >
    <div>
      <p class="font-semibold">{{ theater.name }}</p>
      <p class="text-xs text-slate-600">
        {{ formatLocation(theater) }}
      </p>
      <p v-if="theater.tagline" class="text-xs text-slate-700 mt-1">
        {{ theater.tagline }}
      </p>
    </div>
    <div class="flex gap-2 flex-wrap items-center">
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
