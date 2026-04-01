<script setup lang="ts">
import { useRequestHeaders } from "#app";
import type { DropdownMenuItem } from "@nuxt/ui";
import TheaterEventDateGroup from "~/components/theater/detail/TheaterEventDateGroup.vue";
import TheaterShowCard from "~/components/theater/detail/TheaterShowCard.vue";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useHomeTheaterMutation } from "~/composables/useHomeTheaterMutation";
import { useMembershipToggle } from "~/composables/useMembershipToggle";
import { getTimeZoneDateKey, normalizeTimeZone } from "~/utils/timezone";
import {
  type TheaterDetails,
  useTheaterDetails,
} from "~/composables/useTheaterDetails";

type PublicEvent = NonNullable<TheaterDetails["shows"]["public"][number]>;

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { homeId } = useHomeTheaterState();
const { toggleMembership } = useMembershipToggle();
const { saveHome } = useHomeTheaterMutation();
const relationshipLoading = ref(false);

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
const publicEvents = computed(() => data.value?.shows.public || []);
const upcomingShows = computed(() =>
  publicEvents.value.filter((event) => event.eventType === "show").slice(0, 3),
);
const upcomingNonShowEvents = computed(() =>
  publicEvents.value.filter((event) => event.eventType !== "show"),
);
const nextShow = computed(() => upcomingShows.value[0] || null);
const nextEvent = computed(() => upcomingNonShowEvents.value[0] || null);
const theaterTimeZone = computed(() =>
  normalizeTimeZone(theater.value?.timezone),
);
const fullAddress = computed(() => {
  const parts = [
    theater.value?.street,
    theater.value?.city,
    theater.value?.state_region,
    theater.value?.postal_code,
    theater.value?.country,
  ].filter(Boolean);

  return parts.join(", ") || "Address not posted";
});
const theaterAlerts = computed(() => [
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

const artworkToneClasses = [
  "bg-[linear-gradient(155deg,rgba(231,180,55,0.94),rgba(251,247,239,0.2)_58%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(94,144,217,0.92),rgba(251,247,239,0.18)_55%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(191,77,70,0.9),rgba(251,247,239,0.16)_54%,rgba(43,41,38,0.9))]",
] as const;

const artworkToneClass = (index: number) =>
  artworkToneClasses[index % artworkToneClasses.length];

const producerLabel = (event: PublicEvent) => {
  if (!event.producers.length) {
    return "Producer unassigned";
  }

  const lead = event.producers[0]?.displayName ?? "Producer";
  if (event.producers.length === 1) {
    return lead;
  }

  return `${lead} +${event.producers.length - 1}`;
};

const eventTypeLabel = (value: PublicEvent["eventType"]) => {
  if (!value) return "Event";

  switch (value) {
    case "show":
      return "Show";
    case "practice":
      return "Practice";
    case "workshop":
      return "Workshop";
    case "meeting":
      return "Meeting";
    case "audition":
      return "Audition";
    default:
      return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
};

const eventToneClass = (event: PublicEvent) =>
  event.eventType === "show"
    ? "bg-(--stage-event) text-(--stage-ink)"
    : "bg-(--stage-theater) text-(--stage-ink)";

const castPreviewLabel = (event: PublicEvent) => {
  if (!event.cast.length) {
    return "No cast posted yet";
  }

  const names = event.cast
    .slice(0, 3)
    .map((member) => member.displayName ?? member.userId);

  if (event.cast.length <= 3) {
    return names.join(", ");
  }

  return `${names.join(", ")} +${event.cast.length - 3}`;
};

const eventDateKey = (value: string | null) =>
  getTimeZoneDateKey(value, theaterTimeZone.value);
const groupedPublicEvents = computed(() => {
  const groups: {
    dateKey: string;
    dateLabel: string;
    items: PublicEvent[];
  }[] = [];

  for (const event of publicEvents.value) {
    const dateKey = eventDateKey(event.startsAt);
    const previousGroup = groups[groups.length - 1];

    if (previousGroup && previousGroup.dateKey === dateKey) {
      previousGroup.items.push(event);
      continue;
    }

    groups.push({
      dateKey,
      dateLabel: formatDate(event.startsAt),
      items: [event],
    });
  }

  return groups;
});

const handleFollowToggle = async () => {
  if (!theater.value) return;

  relationshipLoading.value = true;
  try {
    await toggleMembership(
      {
        id: theater.value.id,
        slug: theater.value.slug,
        name: theater.value.name,
      },
      isMember.value ? "leave" : "join",
    );

    if (isMember.value && isHome.value) {
      await saveHome(null);
    }
  } finally {
    relationshipLoading.value = false;
  }
};

const handleHomeToggle = async () => {
  if (!theater.value) return;

  relationshipLoading.value = true;
  try {
    if (isHome.value) {
      await saveHome(null);
    } else {
      if (!isMember.value) {
        await toggleMembership(
          {
            id: theater.value.id,
            slug: theater.value.slug,
            name: theater.value.name,
          },
          "join",
        );
      }

      await saveHome(theater.value.id);
    }
  } finally {
    relationshipLoading.value = false;
  }
};

const theaterActionsMenuItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[][] = [
    [
      {
        label: "Full calendar",
        icon: "i-heroicons-calendar-days",
        to: `/theaters/${slug.value}/calendar`,
      },
    ],
  ];

  if (isMember.value) {
    items[0]?.push({
      label: "Create an event",
      icon: "i-heroicons-plus",
      to: `/theaters/${slug.value}/shows/new`,
    });
  }

  if (canReview.value) {
    items[0]?.push({
      label: "Theater admin",
      icon: "i-heroicons-shield-check",
      to: `/theaters/${slug.value}/admin`,
    });
  }

  items.push([
    {
      label: isMember.value ? "Unfollow theater" : "Follow theater",
      icon: isMember.value
        ? "i-heroicons-minus-circle"
        : "i-heroicons-plus-circle",
      disabled: relationshipLoading.value || !theater.value,
      onSelect: handleFollowToggle,
    },
    {
      label: isHome.value ? "Remove home theater" : "Make home theater",
      icon: "i-heroicons-home",
      disabled: relationshipLoading.value || !theater.value,
      onSelect: handleHomeToggle,
    },
  ]);

  return items;
});

const passiveRelationshipLabel = computed(() => {
  if (isHome.value && isMember.value) {
    return "Following + home theater";
  }

  if (isHome.value) {
    return "Home theater";
  }

  if (isMember.value) {
    return "Following";
  }

  return null;
});

const formatWithTheaterTimeZone = (
  value: string | null,
  options: Intl.DateTimeFormatOptions,
) => {
  if (!value) return "TBD";

  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: theaterTimeZone.value,
  }).format(new Date(value));
};

const formatDateTime = (value: string | null) =>
  formatWithTheaterTimeZone(value, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatDate = (value: string | null) =>
  formatWithTheaterTimeZone(value, {
    month: "short",
    day: "numeric",
  });

const formatTime = (value: string | null) =>
  formatWithTheaterTimeZone(value, {
    hour: "numeric",
    minute: "2-digit",
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
        :next-event="nextEvent"
        :next-show="nextShow"
        :format-date="formatDate"
        :format-time="formatTime"
        :event-type-label="eventTypeLabel"
        :producer-label="producerLabel"
        :cast-label="castPreviewLabel"
      />
    </StageSection>

    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)"
      inner-class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8"
    >
      <div class="space-y-5">
        <StageSectionHeader
          overline="What's on stage?"
          title="Upcoming Shows"
          description="Keep the spotlight on the theater overall while still making the next shows easy to scan."
          description-class="max-w-2xl"
          overline-class="text-[rgba(43,41,38,0.62)]"
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
        </StageSectionHeader>

        <div v-if="upcomingShows.length" class="grid gap-4 xl:grid-cols-3">
          <TheaterShowCard
            v-for="(show, index) in upcomingShows"
            :key="show.id"
            :slug="slug"
            :show="show"
            :theater-name="theater?.name"
            :artwork-tone-class="artworkToneClass(index)"
            :format-date="formatDate"
            :format-time="formatTime"
            :producer-label="producerLabel"
            :cast-label="castPreviewLabel"
          />
        </div>

        <div
          v-else-if="!isLoading"
          class="border-3 border-dashed border-(--stage-ink) bg-[rgba(251,247,239,0.78)] px-5 py-6"
        >
          <p class="stage-overline">Upcoming shows</p>
          <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
            No public shows are posted yet
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
            The theater section above still works as the public home base, and
            the full calendar is ready once shows are scheduled.
          </p>
        </div>
      </div>
    </StageSection>

    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8"
    >
      <div class="space-y-5">
        <StageSectionHeader
          overline="All upcoming events"
          title="Everything on the board"
          description="This list includes every approved, visible upcoming event for this theater, including shows and non-show programming."
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
        </StageSectionHeader>

        <div v-if="groupedPublicEvents.length" class="space-y-4">
          <TheaterEventDateGroup
            v-for="group in groupedPublicEvents"
            :key="group.dateKey"
            :slug="slug"
            :theater-name="theater?.name"
            :group="group"
            :format-date-time="formatDateTime"
            :event-type-label="eventTypeLabel"
            :event-tone-class="eventToneClass"
            :producer-label="producerLabel"
            :cast-label="castPreviewLabel"
          />
        </div>

        <div
          v-else-if="!isLoading"
          class="border-3 border-dashed border-(--stage-ink) bg-[rgba(251,247,239,0.78)] px-5 py-6"
        >
          <p class="stage-overline">Programming signal</p>
          <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
            Nothing public is on the board yet
          </h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
            Once approved events are scheduled here, this section should become
            the full public scan of what is coming up at this theater.
          </p>
          <div class="mt-5 flex flex-wrap gap-2">
            <StageButton
              variant="ghost"
              tone="neutral"
              :to="`/theaters/${slug}/calendar`"
              icon="i-heroicons-calendar-days"
            >
              Open calendar
            </StageButton>
            <StageButton
              v-if="isMember"
              variant="ghost"
              tone="event"
              :to="`/theaters/${slug}/shows/new`"
              icon="i-heroicons-plus"
            >
              Create an event
            </StageButton>
          </div>
        </div>
      </div>
    </StageSection>
  </div>
</template>
