<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { TheaterDetails } from "~/queries/theaters";
import { stageButtonToneClasses } from "~/utils/stageButtonTone";

type PublicEvent = TheaterDetails["shows"]["public"][number];

type TheaterAlert = {
  id: string;
  title: string;
  description: string;
  posted: string;
  expires: string;
};

const props = defineProps<{
  slug: string;
  theater: TheaterDetails["theater"] | null;
  canReview: boolean;
  isMember: boolean;
  passiveRelationshipLabel: string | null;
  fullAddress: string;
  relationshipLoading: boolean;
  theaterActionsMenuItems: DropdownMenuItem[][];
  theaterAlerts: TheaterAlert[];
  nextEvent: PublicEvent | null;
  nextShow: PublicEvent | null;
  formatDate: (value: string | null) => string;
  formatTime: (value: string | null) => string;
  eventTypeLabel: (value: PublicEvent["eventType"]) => string;
  producerLabel: (event: PublicEvent) => string;
}>();

const theaterAlertsCarousel = useTemplateRef<any>("theaterAlertsCarousel");
const activeTheaterAlertIndex = ref(0);

const dashboardLabel = computed(
  () => props.passiveRelationshipLabel ?? "Theater dashboard",
);

const theaterInitials = computed(() => {
  const name = props.theater?.name?.trim();
  if (!name) return "?";

  const words = name.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
});

const calendarPath = computed(() => `/theaters/${props.slug}/calendar`);
const createEventPath = computed(() => `/theaters/${props.slug}/shows/new`);
const adminPath = computed(() => `/theaters/${props.slug}/admin`);

const eventEmptyCta = computed(() =>
  props.isMember
    ? {
        label: "Host an event",
        to: createEventPath.value,
        icon: "i-heroicons-plus",
      }
    : {
        label: "Open calendar",
        to: calendarPath.value,
        icon: "i-heroicons-calendar-days",
      },
);

const showEmptyCta = computed(() =>
  props.isMember
    ? {
        label: "Host a show",
        to: createEventPath.value,
        icon: "i-heroicons-plus",
      }
    : {
        label: "Open calendar",
        to: calendarPath.value,
        icon: "i-heroicons-calendar-days",
      },
);

const showPosterSrc = computed(() => {
  const text = encodeURIComponent(props.nextShow?.title || "Up Next Show");
  return `https://placehold.co/1080x1350/e7b437/2b2926?text=${text}`;
});

const scrollTheaterAlerts = (direction: "prev" | "next") => {
  const api = theaterAlertsCarousel.value?.emblaApi;
  if (!api) return;

  if (direction === "prev") {
    api.scrollPrev();
    return;
  }

  api.scrollNext();
};

const scrollToTheaterAlert = (index: number) => {
  const api = theaterAlertsCarousel.value?.emblaApi;
  if (!api) return;

  api.scrollTo(index);
};

const handleTheaterAlertSelect = (index: number) => {
  activeTheaterAlertIndex.value = index;
};
</script>

<template>
  <section class="grid gap-5 lg:gap-6 [&>*]:min-w-0">
    <div
      class="border-b-2 border-[rgba(43,41,38,0.14)] pb-4"
    >
      <p
        class="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(43,41,38,0.62)]"
      >
        {{ dashboardLabel }}
      </p>
    </div>

    <div class="grid gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-4 min-w-0 sm:gap-5">
          <UAvatar
            :text="theaterInitials"
            class="size-18 shrink-0 border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.84)] text-xl font-black text-[var(--stage-ink)] sm:size-20 sm:text-2xl"
          />

          <div class="min-w-0 flex-1 space-y-2">
            <h1
              class="break-words font-display text-[clamp(2.7rem,11vw,7rem)] uppercase leading-[0.88] tracking-[0.03em] text-[var(--stage-ink)]"
            >
              {{ theater?.name || slug }}
            </h1>

            <p
              v-if="canReview"
              class="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(43,41,38,0.62)]"
            >
              Oversight access
            </p>
          </div>
        </div>

        <p
          v-if="theater?.tagline"
          class="min-w-0 text-lg leading-8 text-[rgba(43,41,38,0.82)]"
        >
          {{ theater.tagline }}
        </p>
        <p class="min-w-0 text-sm leading-7 text-[rgba(43,41,38,0.72)]">
          {{ fullAddress }}
        </p>
      </div>
    </div>

    <div class="flex w-full min-w-0 flex-wrap items-center gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        :to="calendarPath"
        icon="i-heroicons-calendar-days"
        class="w-full sm:w-auto"
        :class="stageButtonToneClasses('event')"
      >
        Full calendar
      </UButton>
      <UButton
        v-if="isMember"
        color="neutral"
        variant="ghost"
        :to="createEventPath"
        icon="i-heroicons-plus"
        class="hidden md:inline-flex"
        :class="stageButtonToneClasses('event')"
      >
        Create an event
      </UButton>
      <UButton
        v-if="canReview"
        color="neutral"
        variant="ghost"
        :to="adminPath"
        icon="i-heroicons-shield-check"
        class="hidden lg:inline-flex"
        :class="stageButtonToneClasses('theater')"
      >
        Theater admin
      </UButton>
      <UDropdownMenu
        v-if="theater"
        class="w-full sm:w-auto sm:ml-auto"
        :items="theaterActionsMenuItems"
        :content="{ align: 'end', sideOffset: 8 }"
        :ui="{
          content:
            'w-64 rounded-none border-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] p-0 shadow-[8px_8px_0_0_var(--stage-ink)]',
          viewport: 'p-0',
          group: 'p-0',
          item: 'rounded-none border-b border-[rgba(43,41,38,0.12)] px-3 py-3 last:border-b-0 data-[highlighted]:bg-[var(--stage-paper-strong)] data-[highlighted]:text-[var(--stage-ink)]',
          itemLeadingIcon: 'size-4 text-[var(--stage-ink)]',
          itemLabel: 'text-sm font-medium text-[var(--stage-ink)]',
        }"
      >
        <UButton
          size="sm"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-ellipsis-horizontal"
          class="w-full sm:w-auto"
          :loading="relationshipLoading"
          :class="stageButtonToneClasses('neutral')"
        >
          Theater actions
        </UButton>
      </UDropdownMenu>
    </div>

    <div>
      <UCarousel
        ref="theaterAlertsCarousel"
        loop
        fade
        :autoplay="{ delay: 10000 }"
        :items="theaterAlerts"
        align="start"
        @select="handleTheaterAlertSelect"
        :ui="{ item: 'basis-full' }"
      >
        <template #default="{ item }">
          <article
            class="min-h-[14rem] border-2 border-[var(--stage-ink)] bg-[rgba(241,250,248,0.76)] px-4 py-4 sm:px-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="stage-overline text-[rgba(43,41,38,0.62)]">
                  Theater Alerts
                </p>
                <h2
                  class="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-[var(--stage-ink)]"
                >
                  {{ item.title }}
                </h2>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-arrow-left"
                  :class="stageButtonToneClasses('neutral')"
                  @click="scrollTheaterAlerts('prev')"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-arrow-right"
                  :class="stageButtonToneClasses('neutral')"
                  @click="scrollTheaterAlerts('next')"
                />
              </div>
            </div>

            <p class="mt-4 text-sm leading-7 text-[rgba(43,41,38,0.78)]">
              {{ item.description }}
            </p>

            <div
              class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[rgba(43,41,38,0.14)] pt-3"
            >
              <div class="flex items-center gap-2">
                <button
                  v-for="(alert, index) in theaterAlerts"
                  :key="alert.id"
                  type="button"
                  class="h-2.5 w-2.5 border border-[var(--stage-ink)] transition-colors"
                  :class="
                    index === activeTheaterAlertIndex
                      ? 'bg-[var(--stage-ink)]'
                      : 'bg-transparent hover:bg-[var(--stage-paper)]'
                  "
                  :aria-label="`Open alert ${index + 1}`"
                  @click="scrollToTheaterAlert(index)"
                />
              </div>

              <div
                class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(43,41,38,0.62)]"
              >
                <span>{{ item.posted }}</span>
                <span>{{ item.expires }}</span>
              </div>
            </div>
          </article>
        </template>
      </UCarousel>
    </div>

    <div class="grid gap-4 xl:grid-cols-2">
      <article
        class="min-h-[14rem] border-2 border-[var(--stage-ink)] bg-[rgba(241,250,248,0.76)] px-4 py-4 sm:px-5"
      >
        <div class="space-y-5">
          <div class="space-y-2">
            <p class="stage-overline text-[rgba(43,41,38,0.62)]">
              Up Next Event
            </p>
          </div>

          <template v-if="nextEvent">
            <div class="flex flex-wrap items-center gap-2">
              <span class="stage-chip bg-[var(--stage-theater)]">
                {{ eventTypeLabel(nextEvent.eventType) }}
              </span>
              <span class="stage-chip bg-[rgba(251,247,239,0.84)]">
                {{ formatDate(nextEvent.startsAt) }}
              </span>
              <span class="stage-chip bg-[rgba(251,247,239,0.84)]">
                {{ formatTime(nextEvent.startsAt) }}
              </span>
            </div>

            <div class="space-y-3">
              <NuxtLink :to="`/theaters/${slug}/shows/${nextEvent.id}`" class="block">
                <h2
                  class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-[var(--stage-ink)]"
                >
                  {{ nextEvent.title }}
                </h2>
              </NuxtLink>
              <p class="text-sm leading-7 text-[rgba(43,41,38,0.78)]">
                {{
                  nextEvent.description ||
                  `Upcoming ${eventTypeLabel(nextEvent.eventType).toLowerCase()} at ${theater?.name || "this theater"}.`
                }}
              </p>
            </div>

            <div class="text-sm leading-6 text-[rgba(43,41,38,0.78)]">
              <span class="font-semibold text-[var(--stage-ink)]">Producer:</span>
                {{ producerLabel(nextEvent) }}
              </div>

            <div class="border-t-2 border-[rgba(43,41,38,0.14)] pt-3">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                :to="`/theaters/${slug}/shows/${nextEvent.id}`"
              >
                Open event
              </UButton>
            </div>
          </template>

          <template v-else>
            <div class="space-y-3">
              <h2
                class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-[var(--stage-ink)]"
              >
                No non-show event is up next
              </h2>
              <p class="text-sm leading-7 text-[rgba(43,41,38,0.78)]">
                Keep this card visible so the dashboard still signals that the
                theater can host workshops, auditions, meetings, and other
                programming beyond shows.
              </p>
            </div>

            <div class="border-t-2 border-[rgba(43,41,38,0.14)] pt-3">
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                :to="eventEmptyCta.to"
                :icon="eventEmptyCta.icon"
              >
                {{ eventEmptyCta.label }}
              </UButton>
            </div>
          </template>
        </div>
      </article>

      <article
        class="min-h-[14rem] border-2 border-[var(--stage-ink)] bg-[rgba(241,250,248,0.76)] px-4 py-4 sm:px-5"
      >
        <div class="grid gap-5 sm:grid-cols-[minmax(6rem,6.75rem)_minmax(0,1fr)]">
          <div class="space-y-2">
            <p class="stage-overline text-[rgba(43,41,38,0.62)]">Up Next Show</p>
            <div
              class="relative aspect-[1080/1350] overflow-hidden border-2 border-[var(--stage-ink)] bg-[var(--stage-paper-strong)]"
            >
              <img
                :src="showPosterSrc"
                :alt="nextShow ? `${nextShow.title} poster placeholder` : 'Up next show poster placeholder'"
                class="h-full w-full object-cover"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(43,41,38,0.02),rgba(43,41,38,0.26))]"
              />
            </div>
          </div>

          <div class="min-w-0 space-y-5">
            <template v-if="nextShow">
              <div class="flex flex-wrap items-center gap-2">
                <span class="stage-chip bg-[var(--stage-event)]">
                  {{ formatDate(nextShow.startsAt) }}
                </span>
                <span class="stage-chip bg-[rgba(251,247,239,0.84)]">
                  {{ formatTime(nextShow.startsAt) }}
                </span>
              </div>

              <div class="space-y-3">
                <NuxtLink :to="`/theaters/${slug}/shows/${nextShow.id}`" class="block">
                  <h2
                    class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-[var(--stage-ink)]"
                  >
                    {{ nextShow.title }}
                  </h2>
                </NuxtLink>
                <p class="text-sm leading-7 text-[rgba(43,41,38,0.78)]">
                  {{
                    nextShow.description ||
                    `Upcoming show at ${theater?.name || "this theater"}.`
                  }}
                </p>
              </div>

              <div class="text-sm leading-6 text-[rgba(43,41,38,0.78)]">
                <span class="font-semibold text-[var(--stage-ink)]">Producer:</span>
                {{ producerLabel(nextShow) }}
              </div>

              <div class="border-t-2 border-[rgba(43,41,38,0.14)] pt-3">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :to="`/theaters/${slug}/shows/${nextShow.id}`"
                >
                  Open show
                </UButton>
              </div>
            </template>

            <template v-else>
              <div class="space-y-3">
                <h2
                  class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-[var(--stage-ink)]"
                >
                  No show is up next
                </h2>
                <p class="text-sm leading-7 text-[rgba(43,41,38,0.78)]">
                  Keep this slot visible so the board still reads like a theater
                  dashboard instead of collapsing into a generic empty state.
                </p>
              </div>

              <div class="border-t-2 border-[rgba(43,41,38,0.14)] pt-3">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :to="showEmptyCta.to"
                  :icon="showEmptyCta.icon"
                >
                  {{ showEmptyCta.label }}
                </UButton>
              </div>
            </template>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
