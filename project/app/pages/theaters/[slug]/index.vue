<script setup lang="ts">
import { useRequestHeaders } from "#app";
import TheaterDetailSection from "~/components/theater/detail/TheaterDetailSection.vue";
import TheaterEmptyStateCard from "~/components/theater/detail/TheaterEmptyStateCard.vue";
import TheaterEventDateGroup from "~/components/theater/detail/TheaterEventDateGroup.vue";
import TheaterUpcomingCard from "~/components/theater/detail/TheaterUpcomingCard.vue";
import { useTheaterPublicEvents } from "~/composables/useTheaterPublicEvents";
import { useTheaterRelationshipActions } from "~/composables/useTheaterRelationshipActions";
import {
  type TheaterMeta,
  type TheaterUpcomingResponse,
  useTheaterMeta,
  useTheaterUpcoming,
} from "~/composables/useTheaterDetails";
import {
  getTheaterFullAddress,
  type TheaterAlert,
} from "~/utils/theaterPresentation";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data: initialTheater } = await useAsyncData(
  () =>
    $fetch<TheaterMeta>(`/api/theaters/${slug.value}/meta`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data } = useTheaterMeta(slug, initialTheater);
const { data: upcomingData, isLoading: upcomingLoading } =
  useTheaterUpcoming(slug);

const theater = computed(() => data.value?.theater || null);
const membership = computed(() => data.value?.membership || null);
const canCreateShow = computed(
  () => data.value?.permissions?.canCreateShow ?? false,
);
const canReview = computed(() => data.value?.permissions?.canReview ?? false);
const upcoming = computed<TheaterUpcomingResponse>(() => ({
  otherEvents: upcomingData.value?.otherEvents ?? [],
  shows: upcomingData.value?.shows ?? [],
}));
const fullAddress = computed(() => getTheaterFullAddress(theater.value));
const theaterAlerts = computed<TheaterAlert[]>(() => [
  {
    id: "auditions-weekend",
    title: "Auditions this weekend",
    description:
      "Theater Admin alerts will appear here for the whole community. This slot can call out weekend auditions, lineup deadlines, or high-visibility reminders.",
    posted: "Posted Tue, Apr 1",
    expires: "Expires Sun, Apr 6",
  },
  {
    id: "class-registration",
    title: "Class registration ends soon",
    description:
      "Use this card for deadline-driven updates like registration windows, workshop sign-ups, or schedule changes that matter to the entire theater community.",
    posted: "Posted Mon, Mar 31",
    expires: "Expires Fri, Apr 4",
  },
  {
    id: "community-night",
    title: "Community night lineup posted",
    description:
      "This can also carry positive board-wide announcements like community showcases, festival notes, or new public programming updates.",
    posted: "Posted Sat, Mar 29",
    expires: "Expires Wed, Apr 9",
  },
]);

const {
  groupedNonShowEvents,
  nextEvent: presentedNextEvent,
  nextShow: presentedNextShow,
  upcomingShows,
} = useTheaterPublicEvents({
  otherEvents: computed(() => upcoming.value.otherEvents),
  shows: computed(() => upcoming.value.shows),
  theater,
});

const {
  isMember,
  passiveRelationshipLabel,
  relationshipLoading,
  theaterActionsMenuItems,
} = useTheaterRelationshipActions({
  slug,
  theater,
  membership,
  canReview,
});
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-theater) overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <TheaterDashboardSection
        :slug="slug"
        :theater="theater"
        :can-review="canReview"
        :is-member="isMember"
        :passive-relationship-label="passiveRelationshipLabel"
        :full-address="fullAddress"
        :relationship-loading="relationshipLoading"
        :theater-actions-menu-items="theaterActionsMenuItems"
        :theater-alerts="theaterAlerts"
        :dashboard-loading="upcomingLoading"
        :next-event="presentedNextEvent"
        :next-show="presentedNextShow"
      />
    </StageSection>

    <TheaterDetailSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)"
      overline="What's on stage?"
      title="Upcoming Shows"
      description="Keep the spotlight on the theater overall while still making the next shows easy to scan."
      description-class="max-w-2xl"
      overline-class="text-stage-ink/60"
    >
      <template #actions>
        <StageButton
          size="xs"
          variant="ghost"
          tone="event"
          :to="`/theaters/${slug}/calendar`"
          icon="i-heroicons-arrow-right"
        >
          Full calendar
        </StageButton>
      </template>

      <div
        v-if="upcomingShows.length"
        class="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3"
      >
        <TheaterUpcomingCard
          v-for="show in upcomingShows"
          :key="show.occurrenceId"
          section-label="Show"
          :event="show"
          surface-tone="event"
          :label-tone-class="show.eventToneClass"
          :poster-alt="`${show.title} poster`"
          :artwork-tone-class="show.artworkToneClass"
          empty-title=""
          empty-description=""
          :empty-cta="{
            label: 'Open show',
            to: show.eventPath,
            icon: 'i-heroicons-arrow-right',
          }"
        />
      </div>

      <TheaterEmptyStateCard
        v-else-if="presentedNextShow && !upcomingLoading"
        overline="Upcoming shows"
        title="The next show is already highlighted above"
        description="Additional shows will appear here when the theater board is configured to show more than the dashboard slot and more upcoming public shows are available."
      />

      <TheaterEmptyStateCard
        v-else-if="!upcomingLoading"
        overline="Upcoming shows"
        title="No public shows are posted yet"
        description="The theater section above still works as the public home base, and the full calendar is ready once shows are scheduled."
      />
    </TheaterDetailSection>

    <TheaterDetailSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden"
      overline="Public events"
      title="Non-Show Events"
      description="This list highlights the next public non-show events for the theater, including workshops, auditions, meetings, and other community programming."
    >
      <template #actions>
        <StageButton
          size="xs"
          variant="ghost"
          tone="neutral"
          :to="`/theaters/${slug}/calendar`"
          icon="i-heroicons-calendar-days"
        >
          Open full calendar
        </StageButton>
      </template>

      <div v-if="groupedNonShowEvents.length" class="space-y-4">
        <TheaterEventDateGroup
          v-for="group in groupedNonShowEvents"
          :key="group.dateKey"
          :group="group"
        />
      </div>

      <TheaterEmptyStateCard
        v-else-if="presentedNextEvent && !upcomingLoading"
        overline="Programming signal"
        title="The next non-show event is already highlighted above"
        description="Additional workshops, auditions, meetings, and other public events will appear here when the theater board is configured to show more than the dashboard slot and more upcoming programming is available."
      />

      <TheaterEmptyStateCard
        v-else-if="!upcomingLoading"
        overline="Programming signal"
        title="No public non-show events are posted yet"
        description="Once workshops, auditions, meetings, or other public events are scheduled here, this section will keep them visible without mixing them into the show list."
      >
        <template #actions>
          <StageButton
            variant="ghost"
            tone="neutral"
            :to="`/theaters/${slug}/calendar`"
            icon="i-heroicons-calendar-days"
          >
            Open calendar
          </StageButton>
          <StageButton
            v-if="canCreateShow"
            variant="ghost"
            tone="event"
            :to="`/theaters/${slug}/shows/new`"
            icon="i-heroicons-plus"
          >
            Create an event
          </StageButton>
        </template>
      </TheaterEmptyStateCard>
    </TheaterDetailSection>
  </div>
</template>
