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
  <div class="rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          Home theater
        </p>
        <h2 class="text-xl font-semibold">
          {{ theater?.name || "Choose a home theater" }}
        </h2>
        <p v-if="theater?.tagline" class="text-slate-700">
          {{ theater.tagline }}
        </p>
        <p class="text-sm text-slate-600">
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

    <div>
      <div class="flex items-center justify-between">
        <p class="font-semibold text-slate-800">Upcoming shows</p>
        <NuxtLink
          v-if="theater"
          :to="`/theaters/${theater.slug}`"
          class="text-sm text-blue-700 hover:underline"
        >
          See all
        </NuxtLink>
      </div>
      <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UCard v-for="show in shows" :key="show.id" class="h-full">
          <p class="font-semibold">{{ show.title }}</p>
          <p class="text-xs text-slate-600 mt-1">
            {{
              show.startsAt ? new Date(show.startsAt).toLocaleString() : "TBD"
            }}
          </p>
          <p
            v-if="show.description"
            class="text-xs text-slate-700 mt-1 line-clamp-2"
          >
            {{ show.description }}
          </p>
        </UCard>
        <p v-if="!shows?.length" class="text-sm text-slate-600">
          No upcoming shows yet.
        </p>
      </div>

      <div
        v-if="!theater && candidates?.length"
        class="pt-4 border-t border-slate-200 space-y-3"
      >
        <p class="font-semibold text-slate-800">Set a home theater</p>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="c in candidates"
            :key="c.id"
            class="h-full flex flex-col gap-2"
          >
            <div>
              <p class="font-semibold">{{ c.name }}</p>
              <p class="text-xs text-slate-600">{{ formatLocation(c) }}</p>
              <p
                v-if="c.tagline"
                class="text-xs text-slate-700 mt-1 line-clamp-2"
              >
                {{ c.tagline }}
              </p>
            </div>
            <UButton
              size="xs"
              color="primary"
              :to="`/theaters/${c.slug}`"
              variant="ghost"
            >
              Open
            </UButton>
            <UButton
              size="xs"
              color="primary"
              icon="i-heroicons-home"
              :disabled="!onSetHome"
              @click="onSetHome?.(c.id)"
            >
              Make home
            </UButton>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
