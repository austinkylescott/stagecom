import { computed, type Ref } from "vue";
import type { TheaterEventItem, TheaterMeta } from "~/queries/theaters";
import { toEventPath } from "~/utils/routes";
import { getTimeZoneDateKey, normalizeTimeZone } from "~/utils/timezone";

export type PublicEvent = TheaterEventItem;

export type TheaterPresentedEvent = PublicEvent & {
  eventPath: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  dateTimeLabel: string;
  eventType: PublicEvent["show"]["eventType"];
  eventTypeLabel: string;
  eventToneClass: string;
  producerLabel: string;
  castLabel: string;
  summaryDescription: string;
  title: string;
};

export type TheaterPresentedShow = TheaterPresentedEvent & {
  artworkToneClass: string;
};

export type TheaterPresentedEventGroup = {
  dateKey: string;
  dateLabel: string;
  items: TheaterPresentedEvent[];
};

const artworkToneClasses = [
  "bg-[linear-gradient(155deg,rgba(231,180,55,0.94),rgba(251,247,239,0.2)_58%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(94,144,217,0.92),rgba(251,247,239,0.18)_55%,rgba(43,41,38,0.9))]",
  "bg-[linear-gradient(155deg,rgba(191,77,70,0.9),rgba(251,247,239,0.16)_54%,rgba(43,41,38,0.9))]",
] as const;

const eventTypeLabel = (value: PublicEvent["show"]["eventType"]) => {
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

const castLabel = (event: PublicEvent) => {
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

const eventToneClass = (event: PublicEvent) =>
  event.show.eventType === "show"
    ? "bg-(--stage-event) text-(--stage-ink)"
    : "bg-(--stage-theater) text-(--stage-ink)";

const buildSummaryDescription = (
  event: PublicEvent,
  theaterName: string | null | undefined,
) => {
  if (event.show.description) {
    return event.show.description;
  }

  if (event.show.eventType === "show") {
    return `Upcoming show at ${theaterName || "this theater"}.`;
  }

  return `Upcoming ${eventTypeLabel(event.show.eventType).toLowerCase()} at ${theaterName || "this theater"}.`;
};

export const useTheaterPublicEvents = ({
  otherEvents,
  shows,
  theater,
}: {
  otherEvents: Ref<PublicEvent[]>;
  shows: Ref<PublicEvent[]>;
  theater: Ref<TheaterMeta["theater"] | null>;
}) => {
  const theaterTimeZone = computed(() =>
    normalizeTimeZone(theater.value?.timezone),
  );

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

  const formatDateTime = (value: string | null) =>
    formatWithTheaterTimeZone(value, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const presentEvents = (events: PublicEvent[]) =>
    events
      .map((event) => ({
        ...event,
        title: event.show.title,
        eventPath: toEventPath(event.show.theaterSlug, event.show.slug),
        dateKey: getTimeZoneDateKey(event.startsAt, theaterTimeZone.value),
        dateLabel: formatDate(event.startsAt),
        timeLabel: formatTime(event.startsAt),
        dateTimeLabel: formatDateTime(event.startsAt),
        eventType: event.show.eventType,
        eventTypeLabel: eventTypeLabel(event.show.eventType),
        eventToneClass: eventToneClass(event),
        producerLabel: producerLabel(event),
        castLabel: castLabel(event),
        summaryDescription: buildSummaryDescription(event, theater.value?.name),
      }))
      .sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );

  const presentedShows = computed<TheaterPresentedShow[]>(() =>
    presentEvents(shows.value).map((event, index) => ({
      ...event,
      artworkToneClass: artworkToneClasses[index % artworkToneClasses.length],
    })),
  );

  const presentedOtherEvents = computed<TheaterPresentedEvent[]>(() =>
    presentEvents(otherEvents.value),
  );

  const groupedNonShowEvents = computed<TheaterPresentedEventGroup[]>(() => {
    const groups: TheaterPresentedEventGroup[] = [];

    for (const event of presentedOtherEvents.value.slice(1)) {
      const previousGroup = groups[groups.length - 1];

      if (previousGroup && previousGroup.dateKey === event.dateKey) {
        previousGroup.items.push(event);
        continue;
      }

      groups.push({
        dateKey: event.dateKey,
        dateLabel: event.dateLabel,
        items: [event],
      });
    }

    return groups;
  });

  const nextShow = computed(() => presentedShows.value[0] || null);
  const nextEvent = computed(() => presentedOtherEvents.value[0] || null);
  const upcomingShows = computed<TheaterPresentedShow[]>(() =>
    presentedShows.value.slice(1),
  );
  const upcomingNonShowEvents = computed(() => presentedOtherEvents.value.slice(1));

  return {
    groupedNonShowEvents,
    nextEvent,
    nextShow,
    presentedOtherEvents,
    presentedShows,
    theaterTimeZone,
    upcomingNonShowEvents,
    upcomingShows,
  };
};
