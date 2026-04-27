<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import {
  reviewQueueQueryOptions,
  theaterMetaQueryOptions,
} from "~/queries/theaters";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const route = useRoute();
const slug = computed(() => String(route.params.theaterSlug || ""));

const {
  data: metaData,
  error: metaError,
  isLoading: metaLoading,
} = useQuery(
  theaterMetaQueryOptions,
  computed(() => ({ slug: slug.value })),
);
const {
  data: reviewData,
  error: reviewError,
  isLoading: reviewLoading,
} = useQuery(
  reviewQueueQueryOptions,
  computed(() => ({ slug: slug.value })),
);

const theater = computed(() => metaData.value?.theater ?? null);
const queue = computed(() => reviewData.value?.shows ?? []);
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-10">
    <section
      v-if="metaLoading"
      class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]"
    >
      <h1 class="stitch-display text-4xl font-black">Loading Admin Surface</h1>
      <p class="mt-3 text-sm font-bold text-(--stage-ink)/70">
        Pulling theater admin context.
      </p>
    </section>

    <section
      v-else-if="metaError || !theater"
      class="border-[4px] border-(--stage-ink) bg-(--stage-performer-soft) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]"
    >
      <h1 class="stitch-display text-4xl font-black">Admin Unavailable</h1>
      <p class="mt-3 text-sm font-bold">
        {{ metaError?.message || "We couldn't load theater admin data." }}
      </p>
    </section>

    <template v-else>
    <header class="mb-10">
      <p class="stitch-nav-label text-xs tracking-[0.22em] text-(--stage-performer)">Operational Home Surface</p>
      <h1 class="stitch-display mt-3 text-5xl font-black md:text-7xl">{{ theater.name }} Admin</h1>
      <p class="mt-3 max-w-3xl text-lg font-bold text-(--stage-ink)/70">
        Review queue, staff context, and theater tools stay here instead of crowding the public overview page.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-12">
      <section class="space-y-6 lg:col-span-8">
        <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) shadow-[8px_8px_0_0_var(--stage-ink)]">
          <header class="border-b-[4px] border-(--stage-ink) bg-(--stage-performer) p-5">
            <h2 class="stitch-display text-2xl font-black">Review Queue</h2>
          </header>
          <div v-if="reviewLoading" class="p-5 text-sm font-bold text-(--stage-ink)/70">
            Loading review queue.
          </div>
          <div v-else-if="reviewError" class="p-5 text-sm font-bold text-(--stage-performer)">
            {{ reviewError.message || "Review queue is unavailable." }}
          </div>
          <div v-else-if="!queue.length" class="p-5 text-sm font-bold text-(--stage-ink)/70">
            Nothing is currently pending review.
          </div>
          <div v-else>
            <div
              v-for="show in queue"
              :key="show.id"
              class="grid gap-3 border-b border-(--stage-ink)/10 p-5 md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              <div>
                <p class="text-lg font-black">{{ show.title }}</p>
                <p class="mt-1 text-xs font-bold uppercase text-(--stage-ink)/60">
                  {{ show.startsAt ? new Date(show.startsAt).toLocaleString() : "No date set" }}
                </p>
              </div>
              <span class="stitch-border bg-(--stage-event-soft) px-3 py-1 text-xs font-black uppercase">
                {{ show.status.replaceAll('_', ' ') }}
              </span>
              <button class="stitch-border bg-(--stage-ink) px-4 py-2 text-xs font-black uppercase text-(--stage-cream)">
                Review
              </button>
            </div>
          </div>
        </article>
      </section>

      <aside class="space-y-6 lg:col-span-4">
        <article class="border-[4px] border-(--stage-ink) bg-(--stage-theater) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]">
          <h2 class="stitch-display mb-4 text-2xl font-black">Admin Tools</h2>
          <div class="space-y-3">
            <button class="w-full stitch-border bg-(--stage-paper) p-3 text-left text-sm font-black uppercase">Manage members</button>
            <button class="w-full stitch-border bg-(--stage-paper) p-3 text-left text-sm font-black uppercase">Edit settings</button>
            <button class="w-full stitch-border bg-(--stage-paper) p-3 text-left text-sm font-black uppercase">Schedule export</button>
          </div>
        </article>
      </aside>
    </div>
    </template>
  </div>
</template>
