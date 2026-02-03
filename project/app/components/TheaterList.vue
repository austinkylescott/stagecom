<script setup lang="ts">
import TheaterCard from "~/components/TheaterCard.vue";

type Theater = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
  isMember?: boolean;
  isHome?: boolean;
};

const props = withDefaults(
  defineProps<{
    title: string;
    theaters?: Theater[] | null;
    pending?: boolean;
    emptyMessage?: string;
    primaryLabel?: string;
    showFollow?: boolean;
    loadingIds?: Set<string>;
    homeLoadingIds?: Set<string>;
  }>(),
  {
    theaters: null,
    pending: false,
  },
);

const emit = defineEmits<{
  (e: "toggle", action: "join" | "leave", theater: Theater): void;
  (e: "home", action: "set" | "clear", theater: Theater): void;
}>();
</script>

<template>
  <UCard>
    <template #header>
      <slot name="header">
        <div class="flex items-center justify-between">
          <p class="font-semibold">{{ title }}</p>
        </div>
      </slot>
    </template>

    <div
      v-if="pending && (!theaters || theaters.length === 0)"
      class="text-sm text-slate-600"
    >
      Loading...
    </div>
    <div v-else-if="!theaters || theaters.length === 0" class="text-sm text-slate-600">
      {{ emptyMessage || "Nothing yet." }}
    </div>
    <div v-else class="space-y-3">
      <TheaterCard
        v-for="theater in theaters"
        :key="theater.id"
        :theater="theater"
        :is-member="theater.isMember"
        :is-home="theater.isHome"
        :primary-label="primaryLabel"
        :show-follow="showFollow"
        :loading="loadingIds?.has(theater.id)"
        :home-loading="homeLoadingIds?.has(theater.id)"
        @toggle="(action, th) => emit('toggle', action, th)"
        @home="(action, th) => emit('home', action, th)"
      />
    </div>
  </UCard>
</template>
