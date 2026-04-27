<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import {
  theaterDetailsQueryOptions,
  theaterUpcomingQueryOptions,
} from "~/queries/theaters";
import { useTheaterRelationshipActions } from "~/composables/useTheaterRelationshipActions";
import {
  toEventCreatePath,
  toEventPath,
  toTheaterAdminPath,
} from "~/utils/routes";
import {
  demoTheaterDetails,
  demoTheaterUpcoming,
} from "~/utils/stitchDemo";

definePageMeta({
  layout: "hybrid",
});

const route = useRoute();
const slug = computed(() => String(route.params.theaterSlug || ""));

const { data: theaterData } = useQuery(
  theaterDetailsQueryOptions,
  computed(() => ({ slug: slug.value })),
);
const { data: upcomingData } = useQuery(
  theaterUpcomingQueryOptions,
  computed(() => ({ slug: slug.value })),
);

const details = computed(() => theaterData.value ?? demoTheaterDetails);
const upcoming = computed(() =>
  upcomingData.value?.shows?.length || upcomingData.value?.otherEvents?.length
    ? upcomingData.value
    : demoTheaterUpcoming,
);

const tonight = computed(() => upcoming.value.shows.slice(0, 2));
const membership = computed(() => details.value.membership ?? demoTheaterDetails.membership);
const canReview = computed(() => details.value.permissions.canReview);
const isMember = computed(() => membership.value.status === "active");
const canCreateShow = computed(() => details.value.permissions.canCreateShow);

const {
  handleFollowToggle,
  handleHomeToggle,
  isHome,
  passiveRelationshipLabel,
  relationshipLoading,
} = useTheaterRelationshipActions({
  slug,
  theater: computed(() => details.value.theater),
  membership,
  canReview,
});
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-12">
    <div class="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="flex flex-col gap-6 lg:col-span-8">
        <section class="border-[4px] border-(--stage-ink) bg-(--stage-theater) p-8 shadow-[8px_8px_0_0_var(--stage-ink)]">
          <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
            <h1 class="stitch-display text-5xl font-black md:text-7xl">
              {{ details.theater.name }}
            </h1>
            <div class="flex gap-2">
              <span class="stitch-border bg-(--stage-paper) px-3 py-1 text-xs font-black uppercase">Established 2014</span>
              <span class="stitch-border bg-(--stage-event) px-3 py-1 text-xs font-black uppercase">Mainstage</span>
            </div>
          </div>

          <p class="mb-6 max-w-2xl text-xl leading-relaxed text-(--stage-ink)/80">
            {{ details.theater.tagline }}
          </p>

          <div class="flex flex-wrap gap-4">
            <button
              class="flex items-center gap-2 bg-(--stage-ink) px-6 py-3 text-sm font-black uppercase text-(--stage-cream) disabled:opacity-60"
              :disabled="relationshipLoading"
              @click="handleFollowToggle"
            >
              <span>{{ isMember ? "−" : "+" }}</span>
              <span>{{ isMember ? "Leave Theater" : "Join Theater" }}</span>
            </button>
            <button
              class="stitch-border bg-transparent px-6 py-3 text-sm font-black uppercase disabled:opacity-60"
              :disabled="relationshipLoading || (!isMember && !isHome)"
              @click="handleHomeToggle"
            >
              {{ isHome ? "Remove Home Theater" : "Make Home Theater" }}
            </button>
            <span
              v-if="passiveRelationshipLabel"
              class="stitch-border bg-(--stage-paper) px-3 py-3 text-xs font-black uppercase"
            >
              {{ passiveRelationshipLabel }}
            </span>
          </div>
        </section>
      </div>

      <div class="space-y-6 lg:col-span-4">
        <section
          v-if="canReview || canCreateShow"
          class="border-[4px] border-(--stage-ink) bg-(--stage-performer) p-6 text-(--stage-cream) shadow-[4px_4px_0_0_var(--stage-ink)]"
        >
          <h2 class="stitch-display mb-4 flex items-center gap-2 text-2xl font-black">
            <span>■</span>
            <span>Admin Controls</span>
          </h2>
          <div class="space-y-3">
            <NuxtLink
              v-if="canReview"
              :to="toTheaterAdminPath(details.theater.slug)"
              class="block stitch-border bg-(--stage-paper) p-3 text-sm font-black uppercase text-(--stage-ink)"
            >
              Edit Theater Profile
            </NuxtLink>
            <NuxtLink
              v-if="canCreateShow"
              :to="toEventCreatePath(details.theater.slug)"
              class="block stitch-border bg-(--stage-paper) p-3 text-sm font-black uppercase text-(--stage-ink)"
            >
              Create Event
            </NuxtLink>
            <NuxtLink
              v-if="canReview"
              :to="toTheaterAdminPath(details.theater.slug)"
              class="block stitch-border bg-(--stage-paper) p-3 text-sm font-black uppercase text-(--stage-ink)"
            >
              Review Queue
            </NuxtLink>
          </div>
        </section>

        <section class="stitch-panel-cream p-6">
          <h3 class="mb-2 text-sm font-black uppercase text-(--stage-ink)/55">Location</h3>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKgYxBjJ-Ews_9EeSviQejoDNSftvyvDUvj8HEtJjcrn2iwOu0i9LzBTbDQHoR48-kvX4qIxktNdsm-zrpCH0CcPOYg1NlmQHem-8jrEdG1xn57dktBrEtu2sEpjnk4DgAciimsy99aPvVHXAjJGKrpiitzIYmCu-pGYSgNqd7Tzk7GhxoP2hRE7eVHSxRiXW4j98bBSNlScLrzkTdA49Wvwlrqw6DuocrCGGf56lKWUrsLBWLruPQpF214G3R9Halc7zrxjFW6Z0"
            alt="Map"
            class="mb-4 aspect-square w-full border-2 border-(--stage-ink) object-cover grayscale"
          >
          <p class="text-sm font-bold">
            {{ details.theater.street }}<br>
            {{ details.theater.city }}, {{ details.theater.state_region }} {{ details.theater.postal_code }}
          </p>
        </section>
      </div>
    </div>

    <section class="mb-12">
        <div class="mb-8 flex items-center gap-6">
          <h2 class="stitch-display text-4xl font-black">Tonight's Bill</h2>
          <div class="h-1 flex-1 bg-(--stage-ink)" />
          <span class="text-sm font-black uppercase tracking-[0.18em]">
            {{ details.stats.visibleNextThirtyDaysCount }} visible events in next 30 days
          </span>
        </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="show in tonight"
          :key="show.show.id"
          class="flex flex-col border-[4px] border-(--stage-ink) bg-(--stage-paper) shadow-[4px_4px_0_0_var(--stage-ink)]"
        >
          <div class="relative h-48 overflow-hidden border-b-2 border-(--stage-ink)">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSc8FehgblP6btGHmUTF0kAcKq-mcEoJLzI0pFkQsE5yu4OoEk3STCpLWp_JIo5onCDjHHoX6jlj4hjIejGdnxpd2CQA0ZpKac7iTHuDoudSQchdEavXcmdf_Zg7Nm9y9gVlYtJIATW4abho4U8tKPxvEUtnNXLVv6gawtPgeqEe43tkiZkTh8ziXHl7plVDWSrWt0pakcPM6ZSb43ZJgxyMzyhnUaU45S3MH5X6t-gXy0Dsn4xiSWQqPz_kT8R7u37gXUWnugWYg"
              alt="Show"
              class="h-full w-full object-cover"
            >
            <div class="absolute left-4 top-4 stitch-border bg-(--stage-event) px-3 py-1 text-xs font-black uppercase">
              {{ new Date(show.startsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }}
            </div>
          </div>
          <div class="p-6">
            <div class="mb-2 flex items-start justify-between gap-3">
              <h3 class="stitch-display text-2xl font-black">{{ show.show.title }}</h3>
              <span class="stitch-border bg-(--stage-theater-soft) px-2 py-1 text-[10px] font-black uppercase">
                {{ show.show.eventType }}
              </span>
            </div>
            <p class="mb-6 text-sm text-(--stage-ink)/70">{{ show.show.description }}</p>
            <div class="flex items-center justify-between border-t-2 border-(--stage-ink)/10 pt-4">
              <span class="text-xl font-black">{{ show.show.ticketUrl ? "$15.00" : "Free" }}</span>
              <NuxtLink
                :to="toEventPath(show.show.theaterSlug, show.show.slug)"
                class="bg-(--stage-ink) px-4 py-2 text-xs font-black uppercase text-(--stage-cream)"
              >
                {{ show.show.ticketUrl ? "Tickets" : "Sign Up" }}
              </NuxtLink>
            </div>
          </div>
        </article>

        <article
          v-for="event in upcoming.otherEvents.slice(0, 1)"
          :key="event.occurrenceId"
          class="flex flex-col justify-center border-[4px] border-(--stage-ink) bg-(--stage-paper) p-8 text-center shadow-[4px_4px_0_0_var(--stage-ink)]"
        >
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-(--stage-ink) bg-(--stage-theater)">
            ■
          </div>
          <h3 class="stitch-display mb-4 text-3xl font-black">{{ event.show.title }}</h3>
          <p class="mb-6 font-bold">{{ event.show.description }}</p>
          <NuxtLink
            :to="toEventPath(event.show.theaterSlug, event.show.slug)"
            class="border-[4px] border-(--stage-ink) bg-(--stage-event) p-4 text-sm font-black uppercase shadow-[4px_4px_0_0_var(--stage-ink)]"
          >
            View Event
          </NuxtLink>
        </article>
      </div>
    </section>

    <section class="border-[4px] border-(--stage-ink) bg-[color:color-mix(in_srgb,var(--stage-paper)_85%,white)] p-8">
      <h2 class="stitch-display mb-8 text-3xl font-black">The Ensemble</h2>
      <div class="flex flex-wrap gap-6">
        <div
          v-for="person in tonight.flatMap((show) => show.cast).slice(0, 8)"
          :key="person.userId"
          class="flex flex-col items-center gap-2"
        >
          <div class="h-20 w-20 rotate-3 overflow-hidden border-2 border-(--stage-ink) bg-(--stage-paper)" />
          <span class="text-[10px] font-black uppercase">{{ person.displayName || "Unlisted" }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
