<script setup lang="ts">
import { useLocationFormatter } from "~/composables/useLocationFormatter";

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
  loading?: boolean; // membership action loading
  homeLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle", action: "join" | "leave", theater: Theater): void;
  (e: "home", action: "set" | "clear", theater: Theater): void;
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
      <UButton
        size="xs"
        variant="ghost"
        :color="isHome ? 'primary' : 'gray'"
        :icon="isHome ? 'i-heroicons-arrow-left-on-rectangle' : 'i-heroicons-home'"
        :loading="homeLoading"
        :disabled="homeLoading"
        @click="emit('home', isHome ? 'clear' : 'set', theater)"
      />
      <template v-if="showFollow">
        <UButton
          v-if="!isMember"
          size="xs"
          color="primary"
          variant="soft"
          :loading="loading"
          :disabled="loading"
          @click="emit('toggle', 'join', theater)"
        >
          Follow
        </UButton>
        <UButton
          v-else
          size="xs"
          color="red"
          variant="ghost"
          :loading="loading"
          :disabled="loading"
          @click="emit('toggle', 'leave', theater)"
        >
          Unfollow
        </UButton>
      </template>
    </div>
  </div>
</template>
