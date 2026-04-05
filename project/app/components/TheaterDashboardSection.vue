<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { TheaterDetails } from "~/queries/theaters";
import TheaterActionsBar from "~/components/theater/detail/TheaterActionsBar.vue";
import TheaterAlertsCarousel from "~/components/theater/detail/TheaterAlertsCarousel.vue";
import TheaterUpcomingCard from "~/components/theater/detail/TheaterUpcomingCard.vue";
import TheaterHeroHeader from "~/components/theater/detail/TheaterHeroHeader.vue";
import type { TheaterPresentedEvent } from "~/composables/useTheaterPublicEvents";
import type { TheaterAlert } from "~/utils/theaterPresentation";

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
  dashboardLoading: boolean;
  nextEvent: TheaterPresentedEvent | null;
  nextShow: TheaterPresentedEvent | null;
}>();

const calendarPath = computed(() => `/theaters/${props.slug}/calendar`);
const createEventPath = computed(() => `/theaters/${props.slug}/shows/new`);

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
  const text = encodeURIComponent(props.nextShow?.title || "Next Show");
  return `https://placehold.co/1080x1350/e7b437/2b2926?text=${text}`;
});
</script>

<template>
  <section class="grid gap-5 lg:gap-6 *:min-w-0">
    <TheaterHeroHeader
      :slug="slug"
      :theater="theater"
      :can-review="canReview"
      :passive-relationship-label="passiveRelationshipLabel"
      :full-address="fullAddress"
    />

    <TheaterActionsBar
      :theater="theater"
      :slug="slug"
      :can-review="canReview"
      :is-member="isMember"
      :relationship-loading="relationshipLoading"
      :theater-actions-menu-items="theaterActionsMenuItems"
    />

    <TheaterAlertsCarousel :theater-alerts="theaterAlerts" />

    <div class="grid gap-4 xl:grid-cols-2">
      <TheaterUpcomingCard
        section-label="Next Event"
        :loading="dashboardLoading"
        :event="nextEvent"
        surface-tone="theater"
        :label-tone-class="nextEvent?.eventToneClass || ''"
        :emphasized-event-type-label="
          nextEvent ? `Next ${nextEvent.eventTypeLabel}` : undefined
        "
        empty-title="No non-show event is up next"
        empty-description="Keep this card visible so the dashboard still signals that the theater can host workshops, auditions, meetings, and other programming beyond shows."
        :empty-cta="eventEmptyCta"
      />

      <TheaterUpcomingCard
        section-label="Next Show"
        :loading="dashboardLoading"
        :event="nextShow"
        surface-tone="theater"
        :label-tone-class="nextShow?.eventToneClass || ''"
        :emphasized-event-type-label="
          nextShow ? `Next ${nextShow.eventTypeLabel}` : undefined
        "
        :poster-src="showPosterSrc"
        empty-title="No show is up next"
        empty-description="Keep this slot visible so the board still reads like a theater dashboard instead of collapsing into a generic empty state."
        :empty-cta="showEmptyCta"
      />
    </div>
  </section>
</template>
