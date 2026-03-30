<script setup lang="ts">
import { useRequestHeaders } from "#app";
import { CalendarDate } from "@internationalized/date";
import { computed, nextTick, ref, watch } from "vue";
import {
  type ShowScheduleItem,
  type ShowScheduleParams,
  type ShowScheduleResponse,
  useShowSchedule,
} from "~/composables/useShowSchedule";

type TimelineFilter = ShowScheduleParams["timeline"];
const ALL_FILTER_VALUE = "__all__";

const route = useRoute();
const router = useRouter();

const timelineItems = [
  { label: "All", value: "all" as const },
  { label: "Upcoming", value: "upcoming" as const },
  { label: "Past", value: "past" as const },
];

const pad = (value: number) => value.toString().padStart(2, "0");
const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};
const toCalendarDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new CalendarDate(year, month, day);
};
const fromCalendarDate = (value: CalendarDate) =>
  `${value.year}-${pad(value.month)}-${pad(value.day)}`;
const formatMonthLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(parseIsoDate(`${value}-01`));
const formatDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseIsoDate(value));
const formatTimeLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const getQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";

const isValidMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const isValidDate = (value: string) =>
  /^\d{4}-(0[1-9]|1[0-2])-[0-3]\d$/.test(value);

const today = new Date();
const todayMonth = toMonthKey(today);
const todayDate = toIsoDate(today);

const routeMonth = getQueryValue(route.query.month);
const routeDate = getQueryValue(route.query.date);
const routeTimeline = getQueryValue(route.query.timeline);

const resolveMonth = (value: string) => (isValidMonth(value) ? value : todayMonth);
const resolveDate = (month: string, value: string) =>
  isValidDate(value) && value.startsWith(`${month}-`)
    ? value
    : month === todayMonth
      ? todayDate
      : `${month}-01`;

const initialMonth = resolveMonth(routeMonth);
const initialDate = resolveDate(initialMonth, routeDate);

const selectedDate = ref(initialDate);
const theaterFilter = ref(getQueryValue(route.query.theater) || ALL_FILTER_VALUE);
const typeFilter = ref(getQueryValue(route.query.type) || ALL_FILTER_VALUE);
const statusFilter = ref(getQueryValue(route.query.status) || ALL_FILTER_VALUE);
const timelineFilter = ref<TimelineFilter>(
  routeTimeline === "upcoming" || routeTimeline === "past" ? routeTimeline : "all",
);

const scheduleParams = computed<ShowScheduleParams>(() => ({
  month: selectedDate.value.slice(0, 7),
  theater: theaterFilter.value === ALL_FILTER_VALUE ? "" : theaterFilter.value,
  type: typeFilter.value === ALL_FILTER_VALUE ? "" : typeFilter.value,
  status: statusFilter.value === ALL_FILTER_VALUE ? "" : statusFilter.value,
  timeline: timelineFilter.value,
}));

const { data: initialSchedule } = await useAsyncData(() =>
  $fetch<ShowScheduleResponse>("/api/shows/schedule", {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
    params: {
      month: scheduleParams.value.month,
      theater: scheduleParams.value.theater || undefined,
      type: scheduleParams.value.type || undefined,
      status: scheduleParams.value.status || undefined,
      timeline: scheduleParams.value.timeline,
    },
  }),
);

const { data, isLoading, error } = useShowSchedule(scheduleParams, initialSchedule);

const selectedCalendarDate = computed<CalendarDate>({
  get: () => toCalendarDate(selectedDate.value),
  set: (value) => {
    selectedDate.value = fromCalendarDate(value);
  },
});

const currentMonth = computed(() => selectedDate.value.slice(0, 7));
const formattedSelectedDate = computed(() => formatDateLabel(selectedDate.value));
const formattedCurrentMonth = computed(() => formatMonthLabel(currentMonth.value));

const allItems = computed(() => data.value?.items ?? []);
const itemsByDate = computed(() => {
  const map = new Map<string, ShowScheduleItem[]>();

  for (const item of allItems.value) {
    const key = item.startsAt.slice(0, 10);
    const items = map.get(key) ?? [];
    items.push(item);
    map.set(key, items);
  }

  for (const items of map.values()) {
    items.sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
  }

  return map;
});

const selectedDayItems = computed(() => itemsByDate.value.get(selectedDate.value) ?? []);

const agendaItems = computed(() => {
  const now = Date.now();
  const filtered = allItems.value.filter((item) => {
    const startsAt = new Date(item.startsAt).getTime();
    if (timelineFilter.value === "upcoming") return startsAt >= now;
    if (timelineFilter.value === "past") return startsAt < now;
    return true;
  });

  return filtered.slice().sort((left, right) => {
    const leftAt = new Date(left.startsAt).getTime();
    const rightAt = new Date(right.startsAt).getTime();

    if (timelineFilter.value === "past") {
      return rightAt - leftAt;
    }

    return leftAt - rightAt;
  });
});

const upcomingItems = computed(() =>
  allItems.value
    .filter((item) => new Date(item.startsAt).getTime() >= Date.now())
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()),
);

const nextUpItem = computed(() => upcomingItems.value[0] ?? null);
const upcomingCount = computed(() => upcomingItems.value.length);
const todayCount = computed(
  () => itemsByDate.value.get(todayDate)?.length ?? 0,
);
const theatersInViewCount = computed(
  () => new Set(allItems.value.map((item) => item.show.theaterId)).size,
);
const pendingReviewCount = computed(
  () =>
    new Set(
      allItems.value
        .filter((item) => item.show.status === "pending_review")
        .map((item) => item.show.id),
    ).size,
);
const scheduleLead = computed(() => {
  if (timelineFilter.value === "upcoming") {
    return "See what you are producing, performing in, or monitoring next.";
  }

  if (timelineFilter.value === "past") {
    return "Use the board as a record of what already happened and what changed.";
  }

  return "Use this as the operational board for what is happening across your Stagecom work.";
});

const theaterOptions = computed(() => [
  { label: "All theaters", value: ALL_FILTER_VALUE },
  ...(data.value?.filters.theaters ?? []),
]);
const typeOptions = computed(() => [
  { label: "All event types", value: ALL_FILTER_VALUE },
  ...(data.value?.filters.eventTypes ?? []),
]);
const statusOptions = computed(() => [
  { label: "All statuses", value: ALL_FILTER_VALUE },
  ...(data.value?.filters.statuses ?? []),
]);

const newShowLink = computed(() => {
  const firstTheaterSlug = data.value?.filters.theaters?.[0]?.value || "";
  return firstTheaterSlug ? `/theaters/${firstTheaterSlug}/shows/new` : "/theaters";
});

const showDetailLink = (item: ShowScheduleItem) =>
  `/theaters/${item.show.theaterSlug}/shows/${item.show.id}`;

const statusTone = (status: string) => {
  switch (status) {
    case "approved":
      return "primary";
    case "pending_review":
      return "warning";
    case "cancelled":
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
};

const occurrenceToneClass = (item: ShowScheduleItem) => {
  if (item.occurrenceStatus === "cancelled") {
    return "bg-[var(--stage-paper-muted)] opacity-60";
  }

  if (item.occurrenceStatus === "changed") {
    return "bg-[var(--stage-coral)]";
  }

  return "bg-[var(--stage-gold)]";
};

const calendarMarkerClass = () =>
  "bg-[var(--stage-gold)] border border-[var(--stage-ink)]";

const calendarDaySummary = (dateKey: string) => {
  const items = itemsByDate.value.get(dateKey) ?? [];

  return {
    markers: items.slice(0, 3),
  };
};

const jumpMonth = (direction: -1 | 1) => {
  const current = parseIsoDate(`${currentMonth.value}-01`);
  const next = new Date(current.getFullYear(), current.getMonth() + direction, 1);
  selectedDate.value = toIsoDate(next);
};

const calendarDayKey = (day: { year: number; month: number; day: number }) =>
  `${day.year}-${pad(day.month)}-${pad(day.day)}`;

const routeQuery = computed(() => ({
  month: currentMonth.value,
  date: selectedDate.value,
  theater: theaterFilter.value !== ALL_FILTER_VALUE ? theaterFilter.value : undefined,
  type: typeFilter.value !== ALL_FILTER_VALUE ? typeFilter.value : undefined,
  status: statusFilter.value !== ALL_FILTER_VALUE ? statusFilter.value : undefined,
  timeline: timelineFilter.value !== "all" ? timelineFilter.value : undefined,
}));

const normalizedRouteQuery = (query: Record<string, unknown>) => ({
  month: getQueryValue(query.month as string | string[] | undefined) || undefined,
  date: getQueryValue(query.date as string | string[] | undefined) || undefined,
  theater: getQueryValue(query.theater as string | string[] | undefined) || undefined,
  type: getQueryValue(query.type as string | string[] | undefined) || undefined,
  status: getQueryValue(query.status as string | string[] | undefined) || undefined,
  timeline: getQueryValue(query.timeline as string | string[] | undefined) || undefined,
});

const queriesMatch = (
  left: ReturnType<typeof normalizedRouteQuery>,
  right: ReturnType<typeof normalizedRouteQuery>,
) =>
  left.month === right.month &&
  left.date === right.date &&
  left.theater === right.theater &&
  left.type === right.type &&
  left.status === right.status &&
  left.timeline === right.timeline;

watch(
  () => normalizedRouteQuery(route.query as Record<string, unknown>),
  (query) => {
    const nextMonth = resolveMonth(query.month || "");
    const nextDate = resolveDate(nextMonth, query.date || "");
    const nextTheater = query.theater || ALL_FILTER_VALUE;
    const nextType = query.type || ALL_FILTER_VALUE;
    const nextStatus = query.status || ALL_FILTER_VALUE;
    const nextTimeline =
      query.timeline === "upcoming" || query.timeline === "past"
        ? query.timeline
        : "all";

    if (selectedDate.value !== nextDate) {
      selectedDate.value = nextDate;
    }

    if (theaterFilter.value !== nextTheater) {
      theaterFilter.value = nextTheater;
    }

    if (typeFilter.value !== nextType) {
      typeFilter.value = nextType;
    }

    if (statusFilter.value !== nextStatus) {
      statusFilter.value = nextStatus;
    }

    if (timelineFilter.value !== nextTimeline) {
      timelineFilter.value = nextTimeline;
    }
  },
);

watch(
  routeQuery,
  async (query) => {
    await nextTick();

    const nextQuery = normalizedRouteQuery(query);
    const currentQuery = normalizedRouteQuery(route.query as Record<string, unknown>);

    if (queriesMatch(currentQuery, nextQuery)) {
      return;
    }

    await router.replace({ query });
  },
  { flush: "post" },
);
</script>

<template>
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] stage-texture overflow-hidden" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div class="space-y-5">
          <span class="stage-kicker">Programming Board</span>
          <div>
            <h1 class="stage-section-title">Your schedule, queue, and next move.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              {{ scheduleLead }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stage-stat">
              <span class="stage-overline">Upcoming</span>
              <span class="stage-stat-value">{{ upcomingCount }}</span>
              <p class="mt-2 text-sm stage-muted">Occurrences still ahead of you.</p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Today</span>
              <span class="stage-stat-value">{{ todayCount }}</span>
              <p class="mt-2 text-sm stage-muted">Items landing on today's board.</p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Pending review</span>
              <span class="stage-stat-value">{{ pendingReviewCount }}</span>
              <p class="mt-2 text-sm stage-muted">Shows still waiting on theater approval.</p>
            </div>
          </div>
        </div>

        <UCard class="stage-dot-board">
          <template #header>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="stage-overline">Next up</p>
                <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
                  {{ nextUpItem ? nextUpItem.show.title : "Quiet board" }}
                </h2>
              </div>
              <UButton color="warning" icon="i-heroicons-plus" :to="newShowLink">
                New show
              </UButton>
            </div>
          </template>

          <div v-if="nextUpItem" class="space-y-3 text-sm text-[var(--stage-ink)]">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="warning" variant="soft">
                {{ nextUpItem.show.eventType || "show" }}
              </UBadge>
              <UBadge :color="statusTone(nextUpItem.show.status)" variant="soft">
                {{ nextUpItem.show.status.replaceAll("_", " ") }}
              </UBadge>
            </div>
            <p class="font-semibold">
              {{ formatDateLabel(nextUpItem.startsAt.slice(0, 10)) }} at {{ formatTimeLabel(nextUpItem.startsAt) }}
            </p>
            <p class="stage-muted">
              {{ nextUpItem.show.theaterName }} · {{ nextUpItem.occurrenceStatus.replaceAll("_", " ") }}
            </p>
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="border-2 border-[rgba(43,41,38,0.12)] bg-[rgba(251,247,239,0.72)] px-3 py-2">
                <p class="stage-overline stage-muted">Theaters in view</p>
                <p class="mt-1 font-semibold">{{ theatersInViewCount }}</p>
              </div>
              <div class="border-2 border-[rgba(43,41,38,0.12)] bg-[rgba(251,247,239,0.72)] px-3 py-2">
                <p class="stage-overline stage-muted">Selected day</p>
                <p class="mt-1 font-semibold">{{ selectedDayItems.length }} item{{ selectedDayItems.length === 1 ? "" : "s" }}</p>
              </div>
            </div>
          </div>

          <div v-else class="space-y-3 text-sm stage-muted">
            <p>No upcoming occurrences match the current filters.</p>
            <p>Try broadening the timeline or create a new show from a theater you belong to.</p>
          </div>
        </UCard>
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.58)]" inner-class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section class="stage-panel stage-dot-board p-4 sm:p-5">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div class="grid gap-4 md:grid-cols-3">
            <UFormField label="Theater" name="theater">
              <USelect
                v-model="theaterFilter"
                :items="theaterOptions"
                label-key="label"
                value-key="value"
                size="sm"
              />
            </UFormField>
            <UFormField label="Event type" name="type">
              <USelect
                v-model="typeFilter"
                :items="typeOptions"
                label-key="label"
                value-key="value"
                size="sm"
              />
            </UFormField>
            <UFormField label="Show status" name="status">
              <USelect
                v-model="statusFilter"
                :items="statusOptions"
                label-key="label"
                value-key="value"
                size="sm"
              />
            </UFormField>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="stage-overline">Agenda scope</span>
            <UButton
              v-for="item in timelineItems"
              :key="item.value"
              size="xs"
              :variant="timelineFilter === item.value ? 'soft' : 'ghost'"
              @click="timelineFilter = item.value"
            >
              {{ item.label }}
            </UButton>
          </div>
        </div>
      </section>

      <div v-if="error" class="mt-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.42)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <UCard class="stage-dot-board">
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="stage-overline">Month board</p>
                <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
                  {{ formattedCurrentMonth }}
                </h2>
                <p class="mt-2 text-sm stage-muted">
                  Compact month scan with occurrence markers tied to the current filters.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  @click="selectedDate = todayDate"
                >
                  Today
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-arrow-left"
                  @click="jumpMonth(-1)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-arrow-right"
                  @click="jumpMonth(1)"
                />
              </div>
            </div>
          </template>

          <div v-if="isLoading" class="text-sm stage-muted">Loading schedule…</div>

          <UCalendar
            v-else
            v-model="selectedCalendarDate"
            :month-controls="false"
            :year-controls="false"
            class="rounded-none border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.78)] p-3"
          >
            <template #day="{ day }">
              <div class="relative flex min-h-14 w-full items-center justify-center px-1 py-1 text-center">
                <span class="relative z-10 text-sm font-semibold text-[var(--stage-ink)]">
                  {{ day.day }}
                </span>

                <div
                  v-if="calendarDaySummary(calendarDayKey(day)).markers.length"
                  class="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1"
                >
                  <span
                    v-for="marker in calendarDaySummary(calendarDayKey(day)).markers"
                    :key="marker.occurrenceId"
                    class="h-2.5 w-2.5 rounded-full"
                    :class="calendarMarkerClass()"
                  />
                </div>
              </div>
            </template>
          </UCalendar>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <p class="stage-overline">Selected day</p>
              <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
                {{ formattedSelectedDate }}
              </h2>
              <p class="mt-2 text-sm stage-muted">
                What is happening on this date.
              </p>
            </div>
          </template>

          <div v-if="isLoading" class="text-sm stage-muted">Loading day detail…</div>

          <div
            v-else-if="!selectedDayItems.length"
            class="border-2 border-dashed border-[var(--stage-ink)] bg-[rgba(251,247,239,0.78)] px-4 py-6 text-sm stage-muted"
          >
            No matching items land on {{ formattedSelectedDate }} with the current filters.
          </div>

          <div v-else class="space-y-3">
            <NuxtLink
              v-for="item in selectedDayItems"
              :key="item.occurrenceId"
              :to="showDetailLink(item)"
              class="stage-list-card block p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="stage-chip bg-[var(--stage-paper-strong)]">
                      {{ item.show.eventType || "show" }}
                    </span>
                    <span class="stage-chip" :class="occurrenceToneClass(item)">
                      {{ item.occurrenceStatus }}
                    </span>
                  </div>
                  <h3 class="mt-3 font-display text-3xl uppercase tracking-[0.08em]">
                    {{ item.show.title }}
                  </h3>
                </div>
                <UBadge :color="statusTone(item.show.status)">
                  {{ item.show.status }}
                </UBadge>
              </div>

              <div class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div class="border-2 border-[rgba(43,41,38,0.12)] bg-[rgba(251,247,239,0.72)] px-3 py-2">
                  <p class="stage-overline stage-muted">Start</p>
                  <p class="mt-1 font-semibold">{{ formatTimeLabel(item.startsAt) }}</p>
                </div>
                <div class="border-2 border-[rgba(43,41,38,0.12)] bg-[rgba(251,247,239,0.72)] px-3 py-2">
                  <p class="stage-overline stage-muted">Theater</p>
                  <p class="mt-1 font-semibold">{{ item.show.theaterName }}</p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </UCard>

        <UCard class="stage-grid-board">
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="stage-overline">Agenda</p>
                <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
                  {{ timelineFilter === "all" ? "Full run" : timelineFilter }}
                </h2>
                <p class="mt-2 text-sm stage-muted">
                  Broader chronology stays visible while the selected day changes.
                </p>
              </div>
              <span class="stage-chip bg-[var(--stage-paper-strong)]">
                {{ agendaItems.length }} items
              </span>
            </div>
          </template>

          <div v-if="isLoading" class="text-sm stage-muted">Loading agenda…</div>

          <div
            v-else-if="!agendaItems.length"
            class="border-2 border-dashed border-[var(--stage-ink)] bg-[rgba(251,247,239,0.78)] px-4 py-6 text-sm stage-muted"
          >
            No schedule items match the current filter combination.
          </div>

          <div v-else class="space-y-3">
            <NuxtLink
              v-for="item in agendaItems"
              :key="item.occurrenceId"
              :to="showDetailLink(item)"
              class="block border-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.92)] p-4 shadow-[5px_5px_0_0_var(--stage-ink)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[4px_4px_0_0_var(--stage-ink)]"
            >
              <div class="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
                <div class="border-2 border-[var(--stage-ink)] bg-[var(--stage-ink)] px-3 py-2 text-[var(--stage-cream)]">
                  <p class="stage-overline text-[var(--stage-paper-muted)]">
                    {{ item.startsAt.slice(0, 10) === selectedDate ? "Selected" : "Date" }}
                  </p>
                  <p class="mt-1 text-sm font-semibold">
                    {{ formatDateLabel(item.startsAt.slice(0, 10)) }}
                  </p>
                  <p class="mt-1 text-xs text-[var(--stage-paper-muted)]">
                    {{ formatTimeLabel(item.startsAt) }}
                  </p>
                </div>

                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="stage-chip bg-[var(--stage-paper-strong)]">
                      {{ item.show.theaterName }}
                    </span>
                    <span class="stage-chip" :class="occurrenceToneClass(item)">
                      {{ item.show.eventType || "show" }} · {{ item.occurrenceStatus }}
                    </span>
                  </div>
                  <h3 class="mt-3 font-display text-3xl uppercase tracking-[0.08em]">
                    {{ item.show.title }}
                  </h3>
                </div>

                <div class="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                  <UBadge :color="statusTone(item.show.status)">
                    {{ item.show.status }}
                  </UBadge>
                  <UButton
                    size="xs"
                    variant="ghost"
                    @click.prevent="selectedDate = item.startsAt.slice(0, 10)"
                  >
                    View day
                  </UButton>
                </div>
              </div>
            </NuxtLink>
          </div>
        </UCard>
      </div>
    </StageSection>
  </div>
</template>
