<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { eventDetailQueryOptions } from "~/queries/shows";

definePageMeta({
  layout: "hybrid",
});

const route = useRoute();
const theaterSlug = computed(() => String(route.params.theaterSlug || ""));
const eventSlug = computed(() => String(route.params.eventSlug || ""));

const { data, error, isLoading } = useQuery(
  eventDetailQueryOptions,
  computed(() => ({
    theaterSlug: theaterSlug.value,
    eventSlug: eventSlug.value,
  })),
);

const detail = computed(() => data.value ?? null);
const nextOccurrence = computed(() => detail.value?.occurrences[0] ?? null);
const castCountLabel = computed(() => {
  const acceptedCount =
    detail.value?.cast.filter((member) => member.status === "accepted").length ?? 0;
  return `${acceptedCount} cast${acceptedCount === 1 ? "" : " members"}`;
});
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-12">
    <section
      v-if="isLoading"
      class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]"
    >
      <h1 class="stitch-display text-4xl font-black">Loading Event</h1>
      <p class="mt-3 text-sm font-bold text-(--stage-ink)/70">
        Pulling event details, cast, and schedule.
      </p>
    </section>

    <section
      v-else-if="error || !detail"
      class="border-[4px] border-(--stage-ink) bg-(--stage-performer-soft) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]"
    >
      <h1 class="stitch-display text-4xl font-black">Event Unavailable</h1>
      <p class="mt-3 text-sm font-bold">
        {{ error?.message || "We couldn't load this event." }}
      </p>
    </section>

    <div v-else class="grid gap-8 lg:grid-cols-12">
      <section class="space-y-6 lg:col-span-8">
        <article class="border-[4px] border-(--stage-ink) bg-(--stage-event) p-8 shadow-[8px_8px_0_0_var(--stage-ink)]">
          <p class="stitch-nav-label text-xs tracking-[0.22em] text-(--stage-ink)/70">
            {{ detail.show.theaterName }} • {{ detail.show.eventType }}
          </p>
          <h1 class="stitch-display mt-3 text-5xl font-black md:text-7xl">
            {{ detail.show.title }}
          </h1>
          <p class="mt-5 max-w-3xl text-lg font-medium text-(--stage-ink)/80">
            {{ detail.show.description || detail.show.summary || "No public event description yet." }}
          </p>
        </article>

        <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]">
          <div class="mb-6 flex items-center justify-between gap-4">
            <h2 class="stitch-display text-3xl font-black">Schedule</h2>
            <span class="stitch-border bg-(--stage-theater-soft) px-3 py-1 text-xs font-black uppercase">
              {{ castCountLabel }}
            </span>
          </div>
          <div class="grid gap-5 md:grid-cols-2">
            <div class="stitch-border bg-(--stage-cream) p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Curtain</p>
              <p class="mt-2 text-2xl font-black">
                {{ nextOccurrence?.starts_at ? new Date(nextOccurrence.starts_at).toLocaleString() : "Schedule TBD" }}
              </p>
            </div>
            <div class="stitch-border bg-(--stage-cream) p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Producer Note</p>
              <p class="mt-2 text-lg font-bold">
                {{ detail.show.producerNote || "No producer note published for this event." }}
              </p>
            </div>
          </div>

          <div class="mt-5 grid gap-5 md:grid-cols-3">
            <div class="stitch-border bg-(--stage-cream) p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Status</p>
              <p class="mt-2 text-lg font-black uppercase">{{ detail.show.status.replaceAll("_", " ") }}</p>
            </div>
            <div class="stitch-border bg-(--stage-cream) p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Casting</p>
              <p class="mt-2 text-lg font-black uppercase">{{ detail.show.castingMode.replaceAll("_", " ") }}</p>
            </div>
            <div class="stitch-border bg-(--stage-cream) p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Tickets</p>
              <a
                v-if="detail.show.ticketUrl"
                :href="detail.show.ticketUrl"
                target="_blank"
                rel="noreferrer"
                class="mt-2 inline-block text-lg font-black underline underline-offset-4"
              >
                Open ticket link
              </a>
              <p v-else class="mt-2 text-lg font-black">No ticket link</p>
            </div>
          </div>
        </article>

      </section>

      <aside class="space-y-6 lg:col-span-4">
        <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]">
          <h2 class="stitch-display mb-4 text-2xl font-black">Producers</h2>
          <div class="space-y-3">
            <div
              v-for="producer in detail.producers"
              :key="producer.userId"
              class="stitch-border bg-(--stage-cream) p-4"
            >
              <p class="font-black">{{ producer.displayName }}</p>
            </div>
          </div>
        </article>

        <article class="border-[4px] border-(--stage-ink) bg-(--stage-performer) p-6 text-(--stage-cream) shadow-[8px_8px_0_0_var(--stage-ink)]">
          <h2 class="stitch-display mb-4 text-2xl font-black">Cast</h2>
          <div class="space-y-3">
            <div
              v-for="member in detail.cast"
              :key="member.userId"
              class="stitch-border bg-(--stage-paper) p-4 text-(--stage-ink)"
            >
              <p class="font-black">{{ member.displayName }}</p>
              <p class="mt-1 text-[10px] font-black uppercase text-(--stage-ink)/60">
                {{ member.status }}<span v-if="member.programOrder"> • Program order {{ member.programOrder }}</span>
              </p>
            </div>
          </div>
        </article>
      </aside>
    </div>
  </div>
</template>
