<script setup lang="ts">
import { useRequestHeaders } from "#app";
import { useLocationFormatter } from "~/composables/useLocationFormatter";
import TheaterFollowHomeButtons from "~/components/TheaterFollowHomeButtons.vue";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import {
  type TheaterDetails,
  useTheaterDetails,
} from "~/composables/useTheaterDetails";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { formatLocation } = useLocationFormatter();
const { homeId } = useHomeTheaterState();

const { data: initialTheater } = await useAsyncData(
  () =>
    $fetch<TheaterDetails>(`/api/theaters/${slug.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, isLoading, error } = useTheaterDetails(slug, initialTheater);

const theater = computed(() => data.value?.theater || null);
const membership = computed(() => data.value?.membership || null);
const isMember = computed(() => membership.value?.status === "active");
const isHome = computed(
  () => membership.value?.isHome || homeId.value === theater.value?.id || false,
);
const canReview = computed(() => data.value?.permissions?.canReview ?? false);
const publicShows = computed(() => data.value?.shows.public || []);
const upcomingShows = computed(() =>
  publicShows.value.filter((show) => show.eventType === "show").slice(0, 5),
);
const nextShow = computed(() => upcomingShows.value[0] || null);
const featuredShows = computed(() => upcomingShows.value.slice(0, 3));
const locationLabel = computed(() => formatLocation(theater.value || undefined));
const memberRoleLabel = computed(() => {
  const roles = membership.value?.roles || [];
  if (!roles.length) return null;

  return roles
    .map((role) => role.replace(/_/g, " "))
    .map((role) => role.charAt(0).toUpperCase() + role.slice(1))
    .join(", ");
});
const scheduleLead = computed(() => {
  if (!publicShows.value.length) {
    return "Use this page as the theater's programming board once approved public events are on the calendar.";
  }

  if (publicShows.value.length === 1) {
    return "Lead with the next public date and make it obvious where people should go next.";
  }

  return "People should understand the next date, the next few events, and how to open the full calendar without hunting for it.";
});
const artworkToneClasses = [
  "bg-[linear-gradient(155deg,rgba(231,180,55,0.92),rgba(251,247,239,0.18)_58%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(94,144,217,0.9),rgba(251,247,239,0.18)_55%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(191,77,70,0.9),rgba(251,247,239,0.16)_54%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(118,152,109,0.9),rgba(251,247,239,0.18)_58%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(123,101,163,0.9),rgba(251,247,239,0.16)_58%,rgba(43,41,38,0.9))]",
] as const;

const artworkToneClass = (index: number) =>
  artworkToneClasses[index % artworkToneClasses.length];

const producerLabel = (
  show: NonNullable<TheaterDetails["shows"]["public"][number]>,
) => {
  if (!show.producers.length) {
    return "Producer unassigned";
  }

  const lead = show.producers[0]?.displayName ?? "Producer";
  if (show.producers.length === 1) {
    return lead;
  }

  return `${lead} +${show.producers.length - 1}`;
};

const formatDateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "TBD";

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(value))
    : "TBD";

const formatTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "TBD";
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div v-if="error" class="mb-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>

      <div class="space-y-6">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-heroicons-megaphone"
          title="Program this page like a theater board"
          :description="scheduleLead"
        />

        <section class="stage-panel overflow-hidden">
          <div class="border-b-3 border-[var(--stage-ink)] bg-[rgba(231,180,55,0.2)] px-5 py-4 sm:px-6">
            <div class="flex flex-wrap items-center gap-2">
              <span class="stage-kicker">
                {{ isHome ? "Home theater board" : "Theater programming board" }}
              </span>
              <span
                v-if="isMember"
                class="stage-chip bg-[var(--stage-theater)] text-[var(--stage-ink)]"
              >
                Member
              </span>
              <span
                v-if="canReview"
                class="stage-chip bg-[var(--stage-gold)] text-[var(--stage-ink)]"
              >
                Oversight
              </span>
            </div>

            <div class="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
              <div>
                <h1 class="stage-section-title">
                  {{ theater?.name || slug }}
                </h1>
                <p
                  v-if="theater?.tagline"
                  class="mt-3 max-w-3xl text-lg leading-8 stage-muted"
                >
                  {{ theater.tagline }}
                </p>
                <p class="mt-2 text-sm stage-muted">
                  {{ locationLabel }}
                </p>
              </div>

              <div class="border-3 border-[var(--stage-ink)] bg-[var(--stage-ink)] px-4 py-4 text-[var(--stage-cream)]">
                <p class="stage-overline text-[var(--stage-paper-muted)]">Board status</p>
                <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                  {{ nextShow ? "Live" : "Waiting" }}
                </p>
                <p class="mt-3 text-sm text-[var(--stage-paper-muted)]">
                  {{ nextShow ? "Upcoming shows are posted." : "No upcoming shows are posted yet." }}
                </p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <TheaterFollowHomeButtons
                v-if="theater"
                :theater="{ id: theater.id, slug: theater.slug, name: theater.name }"
                :is-member="isMember"
                :is-home="isHome"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                :to="`/theaters/${slug}/calendar`"
                icon="i-heroicons-calendar-days"
              >
                Full calendar
              </UButton>
            </div>
          </div>
        </section>
      </div>
    </StageSection>

    <StageSection
      v-if="nextShow"
      outer-class="bg-[var(--stage-event)]"
      inner-class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
    >
      <div class="grid gap-0 xl:grid-cols-[minmax(0,1.06fr)_minmax(21rem,0.94fr)] xl:items-stretch">
        <div class="border-b-3 border-[var(--stage-ink)] p-4 text-[var(--stage-ink)] xl:border-b-0 xl:border-r-3 sm:p-5">
          <div class="flex h-full flex-col">
            <div class="flex flex-wrap items-center gap-2">
              <span class="stage-chip bg-[var(--stage-ink)] text-[var(--stage-cream)]">
                {{ nextShow.eventType || "show" }}
              </span>
              <span class="stage-chip bg-[rgba(251,247,239,0.58)]">
                Next show
              </span>
            </div>

            <div class="mt-4 flex flex-col gap-3 min-[426px]:flex-row min-[426px]:items-stretch sm:gap-4">
              <div
                class="relative aspect-[4/5] w-full max-w-[10rem] shrink-0 border-3 border-[var(--stage-ink)] text-[var(--stage-cream)] min-[426px]:w-[clamp(6.5rem,18vw,9rem)] min-[426px]:max-w-none"
                :class="artworkToneClass(0)"
              >
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,247,239,0.26),transparent_36%),linear-gradient(180deg,transparent,rgba(43,41,38,0.32))]" />
                <div class="relative flex h-full flex-col justify-start p-2 sm:p-3">
                  <p class="text-[9px] font-black uppercase tracking-[0.18em] text-[rgba(251,247,239,0.8)] sm:text-[10px] sm:tracking-[0.22em]">
                    {{ theater?.name || slug }}
                  </p>
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <h2 class="font-display text-2xl uppercase leading-[0.92] tracking-[0.06em] sm:text-3xl lg:text-4xl">
                  {{ nextShow.title }}
                </h2>
                <p class="mt-2 text-sm leading-6 text-[rgba(43,41,38,0.82)] sm:mt-3 sm:leading-7">
                  {{ nextShow.description || `The next public event at ${theater?.name || "this theater"} is scheduled for ${formatDateTime(nextShow.startsAt)}.` }}
                </p>

                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                  <div class="border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.66)] px-3 py-2">
                    <p class="stage-overline">Date</p>
                    <p class="mt-1 text-sm font-semibold">
                      {{ formatDateTime(nextShow.startsAt) }}
                    </p>
                  </div>
                  <div class="border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.66)] px-3 py-2">
                    <p class="stage-overline">Cast</p>
                    <div v-if="nextShow.cast.length" class="mt-1 flex items-center">
                      <div class="flex items-center -space-x-2">
                        <UTooltip
                          v-for="member in nextShow.cast"
                          :key="member.userId"
                          :text="member.displayName ?? member.userId"
                        >
                          <UAvatar
                            :src="member.avatarUrl || undefined"
                            :text="member.displayName?.[0] ?? '?'"
                            size="xs"
                            class="ring-2 ring-[var(--stage-event)]"
                          />
                        </UTooltip>
                      </div>
                    </div>
                    <p v-else class="mt-1 text-sm font-semibold">
                      No cast yet
                    </p>
                  </div>
                  <div class="border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.66)] px-3 py-2">
                    <p class="stage-overline">Producer</p>
                    <p class="mt-1 text-sm font-semibold">
                      {{ producerLabel(nextShow) }}
                    </p>
                  </div>
                </div>

                <div class="mt-5 flex flex-wrap gap-2">
                  <UButton color="neutral" :to="`/theaters/${slug}/shows/${nextShow.id}`">
                    Open event
                  </UButton>
                  <span class="inline-flex">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-ticket"
                      disabled
                    >
                      Tickets
                    </UButton>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-[rgba(43,41,38,0.08)] p-4 sm:p-5">
          <div class="flex flex-col items-start gap-3 min-[360px]:flex-row min-[360px]:items-end min-[360px]:justify-between">
            <div>
              <p class="stage-overline">Upcoming board</p>
              <h3 class="mt-2 font-display text-3xl uppercase tracking-[0.08em] text-[var(--stage-ink)]">
                The next five
              </h3>
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              :to="`/theaters/${slug}/calendar`"
            >
              All shows
            </UButton>
          </div>

          <div class="mt-4 space-y-3">
            <NuxtLink
              v-for="(show, index) in upcomingShows"
              :key="show.id"
              :to="`/theaters/${slug}/shows/${show.id}`"
              class="block border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.74)] p-3 transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <div class="flex items-start gap-3">
                <div
                  class="relative aspect-[4/5] w-[4.5rem] shrink-0 self-start border-2 border-[var(--stage-ink)] text-[var(--stage-cream)] sm:w-[5rem]"
                  :class="artworkToneClass(index)"
                >
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,247,239,0.24),transparent_38%),linear-gradient(180deg,transparent,rgba(43,41,38,0.34))]" />
                  <div class="relative flex h-full flex-col justify-between p-2">
                    <span class="text-[8px] font-black uppercase tracking-[0.18em] text-[rgba(251,247,239,0.82)]">
                      {{ show.eventType || "show" }}
                    </span>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="border-2 border-[var(--stage-ink)] px-2 py-0.5 text-xs font-bold uppercase text-[var(--stage-ink)] bg-[rgba(251,247,239,0.82)]">
                      {{ formatDate(show.startsAt) }}
                    </span>
                    <span class="border-2 border-[var(--stage-ink)] px-2 py-0.5 text-xs font-bold uppercase text-[var(--stage-ink)] bg-[var(--stage-event)]">
                      {{ formatTime(show.startsAt) }}
                    </span>
                    <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[rgba(43,41,38,0.58)]">
                      {{ show.eventType || "show" }}
                    </span>
                  </div>
                  <h4 class="mt-2 font-display text-xl uppercase leading-[0.96] tracking-[0.06em] text-[var(--stage-ink)] sm:text-2xl">
                    {{ show.title }}
                  </h4>
                  <div class="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[rgba(43,41,38,0.72)]">
                    <span v-if="show.cast.length" class="inline-flex items-center gap-2">
                      <span>Cast</span>
                      <span class="flex items-center -space-x-2">
                        <UTooltip
                          v-for="member in show.cast"
                          :key="member.userId"
                          :text="member.displayName ?? member.userId"
                        >
                          <UAvatar
                            :src="member.avatarUrl || undefined"
                            :text="member.displayName?.[0] ?? '?'"
                            size="xs"
                            class="ring-2 ring-[rgba(251,247,239,0.74)]"
                          />
                        </UTooltip>
                      </span>
                    </span>
                    <span>{{ producerLabel(show) }}</span>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2 sm:hidden">
                    <UButton size="xs" color="neutral" variant="ghost">
                      Open
                    </UButton>
                    <span class="inline-flex">
                      <UButton
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        icon="i-heroicons-ticket"
                        disabled
                      >
                        Tickets
                      </UButton>
                    </span>
                  </div>
                </div>

                <div class="hidden shrink-0 sm:flex sm:flex-col sm:items-end sm:gap-2">
                  <UButton size="xs" color="neutral" variant="ghost">
                    Open
                  </UButton>
                  <span class="inline-flex">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-heroicons-ticket"
                      disabled
                    >
                      Tickets
                    </UButton>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </StageSection>

    <StageSection
      outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
    >
      <div class="space-y-6">
        <div
          v-if="!nextShow && !isLoading"
          class="border-3 border-dashed border-[var(--stage-ink)] bg-[rgba(251,247,239,0.78)] px-5 py-6"
        >
              <p class="stage-overline">Programming signal</p>
              <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                Nothing public is on the board yet
              </h2>
              <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
                Once approved shows are scheduled here, this page should immediately tell members and visitors what is coming up and where to click next.
              </p>
              <div class="mt-5 flex flex-wrap gap-2">
                <UButton
                  v-if="isMember"
                  color="warning"
                  :to="`/theaters/${slug}/shows/new`"
                  icon="i-heroicons-plus"
                >
                  Create an event
                </UButton>
                <UButton
                  variant="ghost"
                  color="neutral"
                  :to="`/theaters/${slug}/calendar`"
                  icon="i-heroicons-calendar-days"
                >
                  Open calendar shell
                </UButton>
              </div>
        </div>

        <div class="flex flex-wrap gap-2">
              <UButton
                v-if="isMember"
                variant="ghost"
                color="neutral"
                :to="`/theaters/${slug}/shows/new`"
                icon="i-heroicons-plus"
              >
                Create an event
              </UButton>
              <UButton
                v-if="canReview"
                variant="ghost"
                color="neutral"
                :to="`/theaters/${slug}/admin`"
                icon="i-heroicons-shield-check"
              >
                Theater admin
              </UButton>
        </div>

        <div>
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="stage-overline">Coming up</p>
              <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
                The next run of events
              </h2>
            </div>
          </div>

          <div v-if="featuredShows.length" class="mt-4 grid gap-4">
            <NuxtLink
              v-for="show in featuredShows"
              :key="show.id"
              :to="`/theaters/${slug}/shows/${show.id}`"
              class="block"
            >
              <article class="stage-list-card h-full p-5 sm:p-6">
                <div class="grid gap-4 lg:grid-cols-[8.5rem_minmax(0,1fr)_auto] lg:items-start">
                  <div class="border-2 border-[var(--stage-ink)] bg-[var(--stage-paper-strong)] px-3 py-3 text-center">
                    <p class="stage-overline">Date</p>
                    <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                      {{ formatDate(show.startsAt) }}
                    </p>
                    <p class="mt-2 text-xs font-semibold">
                      {{ formatTime(show.startsAt) }}
                    </p>
                  </div>

                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="stage-chip bg-[var(--stage-event)]">
                        {{ show.eventType || "show" }}
                      </span>
                      <span class="stage-chip bg-[var(--stage-paper-strong)]">
                        Upcoming
                      </span>
                    </div>
                    <h3 class="mt-3 font-display text-4xl uppercase tracking-[0.08em]">
                      {{ show.title }}
                    </h3>
                    <p v-if="show.description" class="mt-3 text-sm leading-7 stage-muted">
                      {{ show.description }}
                    </p>
                  </div>

                  <div class="flex items-start lg:justify-end">
                    <UButton size="xs" color="neutral" variant="ghost">
                      Open
                    </UButton>
                  </div>
                </div>
              </article>
            </NuxtLink>
          </div>
        </div>

        <section class="stage-panel p-5 sm:p-6">
              <p class="stage-overline">Your connection</p>
              <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ isHome ? "This is your home base" : isMember ? "You are active here" : "Public-facing theater view" }}
              </h2>
              <div class="mt-4 space-y-3 text-sm leading-7 stage-muted">
                <p v-if="memberRoleLabel">
                  Active roles: {{ memberRoleLabel }}.
                </p>
                <p v-else-if="isMember">
                  This page stays useful for members because the next dates and event handoffs are kept ahead of back-office controls.
                </p>
                <p v-else>
                  Public viewers should be able to understand what is coming up here without needing theater-specific context first.
                </p>
                <p v-if="canReview">
                  Oversight work still lives on the admin route so this hub can stay programming-led.
                </p>
              </div>
        </section>
      </div>
    </StageSection>
  </div>
</template>
