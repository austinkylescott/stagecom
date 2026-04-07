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
type ViewTab = "my-events" | "theater-calendar";
const ALL_FILTER_VALUE = "__all__";

const route = useRoute();
const router = useRouter();

const timelineItems = [
  { label: "All", value: "all" as const },
  { label: "Upcoming", value: "upcoming" as const },
  { label: "Past", value: "past" as const },
];

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdayLabelsMobile = ["M", "T", "W", "T", "F", "S", "S"];

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
const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parseIsoDate(value));
const formatTimeLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
const formatWeekdayShort = (value: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    parseIsoDate(value),
  );
const formatDayNumber = (value: string) => parseIsoDate(value).getDate();

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

const resolveMonth = (value: string) =>
  isValidMonth(value) ? value : todayMonth;
const resolveDate = (month: string, value: string) =>
  isValidDate(value) && value.startsWith(`${month}-`)
    ? value
    : month === todayMonth
      ? todayDate
      : `${month}-01`;

const initialMonth = resolveMonth(routeMonth);
const initialDate = resolveDate(initialMonth, routeDate);

const selectedDate = ref(initialDate);
const activeTab = ref<ViewTab>("my-events");
const theaterFilter = ref(
  getQueryValue(route.query.theater) || ALL_FILTER_VALUE,
);
const typeFilter = ref(getQueryValue(route.query.type) || ALL_FILTER_VALUE);
const statusFilter = ref(getQueryValue(route.query.status) || ALL_FILTER_VALUE);
const timelineFilter = ref<TimelineFilter>(
  routeTimeline === "upcoming" || routeTimeline === "past"
    ? routeTimeline
    : "all",
);
const filtersOpen = ref(false);

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

const { data, isLoading, error } = useShowSchedule(
  scheduleParams,
  initialSchedule,
);

const selectedCalendarDate = computed<CalendarDate>({
  get: () => toCalendarDate(selectedDate.value),
  set: (value) => {
    selectedDate.value = fromCalendarDate(value);
  },
});

const currentMonth = computed(() => selectedDate.value.slice(0, 7));
const formattedSelectedDate = computed(() =>
  formatDateLabel(selectedDate.value),
);
const formattedCurrentMonth = computed(() =>
  formatMonthLabel(currentMonth.value),
);

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

const selectedDayItems = computed(
  () => itemsByDate.value.get(selectedDate.value) ?? [],
);

// --- Week computation ---
const getWeekDays = (dateStr: string): string[] => {
  const date = parseIsoDate(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toIsoDate(d);
  });
};

const selectedWeekDays = computed(() => getWeekDays(selectedDate.value));

const weekDateRange = computed(() => {
  const days = selectedWeekDays.value;
  return `${formatShortDate(days[0])} – ${formatShortDate(days[6])}`;
});

const weekItems = computed(() => {
  const days = selectedWeekDays.value;
  const result: { date: string; items: ShowScheduleItem[] }[] = [];

  for (const day of days) {
    const dayItems = itemsByDate.value.get(day) ?? [];
    result.push({ date: day, items: dayItems });
  }

  return result;
});

const weekHasItems = computed(() =>
  weekItems.value.some((day) => day.items.length > 0),
);

const jumpWeek = (direction: -1 | 1) => {
  const date = parseIsoDate(selectedDate.value);
  date.setDate(date.getDate() + direction * 7);
  selectedDate.value = toIsoDate(date);
};

// --- Stats ---
const upcomingItems = computed(() =>
  allItems.value
    .filter((item) => new Date(item.startsAt).getTime() >= Date.now())
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    ),
);

const nextUpItem = computed(() => upcomingItems.value[0] ?? null);
const upcomingCount = computed(() => upcomingItems.value.length);
const todayCount = computed(
  () => itemsByDate.value.get(todayDate)?.length ?? 0,
);
const pendingReviewCount = computed(
  () =>
    new Set(
      allItems.value
        .filter((item) => item.show.status === "pending_review")
        .map((item) => item.show.id),
    ).size,
);

// --- Filters ---
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

const hasActiveFilters = computed(
  () =>
    theaterFilter.value !== ALL_FILTER_VALUE ||
    typeFilter.value !== ALL_FILTER_VALUE ||
    statusFilter.value !== ALL_FILTER_VALUE ||
    timelineFilter.value !== "all",
);

const clearFilters = () => {
  theaterFilter.value = ALL_FILTER_VALUE;
  typeFilter.value = ALL_FILTER_VALUE;
  statusFilter.value = ALL_FILTER_VALUE;
  timelineFilter.value = "all";
};

const newShowLink = computed(() => {
  const firstTheaterSlug = data.value?.filters.theaters?.[0]?.value || "";
  return firstTheaterSlug
    ? `/theaters/${firstTheaterSlug}/shows/new`
    : "/theaters";
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
    return "bg-(--stage-paper-muted) opacity-60";
  }

  if (item.occurrenceStatus === "changed") {
    return "bg-(--stage-coral)";
  }

  return "bg-(--stage-gold)";
};

const calendarMarkerClass = () =>
  "bg-(--stage-gold) border border-(--stage-ink)";

const calendarDaySummary = (dateKey: string) => {
  const items = itemsByDate.value.get(dateKey) ?? [];
  return { markers: items.slice(0, 3) };
};

const jumpMonth = (direction: -1 | 1) => {
  const current = parseIsoDate(`${currentMonth.value}-01`);
  const next = new Date(
    current.getFullYear(),
    current.getMonth() + direction,
    1,
  );
  selectedDate.value = toIsoDate(next);
};

const calendarDayKey = (day: { year: number; month: number; day: number }) =>
  `${day.year}-${pad(day.month)}-${pad(day.day)}`;

// --- Route sync ---
const routeQuery = computed(() => ({
  month: currentMonth.value,
  date: selectedDate.value,
  theater:
    theaterFilter.value !== ALL_FILTER_VALUE ? theaterFilter.value : undefined,
  type: typeFilter.value !== ALL_FILTER_VALUE ? typeFilter.value : undefined,
  status:
    statusFilter.value !== ALL_FILTER_VALUE ? statusFilter.value : undefined,
  timeline: timelineFilter.value !== "all" ? timelineFilter.value : undefined,
}));

const normalizedRouteQuery = (query: Record<string, unknown>) => ({
  month:
    getQueryValue(query.month as string | string[] | undefined) || undefined,
  date: getQueryValue(query.date as string | string[] | undefined) || undefined,
  theater:
    getQueryValue(query.theater as string | string[] | undefined) || undefined,
  type: getQueryValue(query.type as string | string[] | undefined) || undefined,
  status:
    getQueryValue(query.status as string | string[] | undefined) || undefined,
  timeline:
    getQueryValue(query.timeline as string | string[] | undefined) || undefined,
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

    if (selectedDate.value !== nextDate) selectedDate.value = nextDate;
    if (theaterFilter.value !== nextTheater) theaterFilter.value = nextTheater;
    if (typeFilter.value !== nextType) typeFilter.value = nextType;
    if (statusFilter.value !== nextStatus) statusFilter.value = nextStatus;
    if (timelineFilter.value !== nextTimeline)
      timelineFilter.value = nextTimeline;
  },
);

watch(
  routeQuery,
  async (query) => {
    await nextTick();

    const nextQuery = normalizedRouteQuery(query);
    const currentQuery = normalizedRouteQuery(
      route.query as Record<string, unknown>,
    );

    if (queriesMatch(currentQuery, nextQuery)) return;
    await router.replace({ query });
  },
  { flush: "post" },
);
</script>

<template>
  <div class="space-y-0">
    <!-- ═══════════════════════════════════════════════════════════════════
         SECTION 1 — HERO
         Desktop: Full hero with stats
         Mobile:  "THE CALL SHEET" focused header
    ═══════════════════════════════════════════════════════════════════ -->
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
    >
      <!-- Mobile-first call sheet header (visible only on mobile) -->
      <div class="lg:hidden">
        <span class="stage-kicker">Daily Operations</span>
        <h1 class="mt-4 stage-title">The Call Sheet</h1>
        <div class="mt-4 flex items-end justify-between gap-3">
          <div>
            <p class="stage-overline stage-muted">Selected date</p>
            <p class="mt-1 font-display text-4xl uppercase tracking-[0.06em]">
              {{ formattedSelectedDate }}
            </p>
          </div>
          <UButton
            color="warning"
            size="sm"
            icon="i-heroicons-plus"
            :to="newShowLink"
          >
            New event
          </UButton>
        </div>
      </div>

      <!-- Desktop hero (hidden on mobile) -->
      <div class="hidden lg:block">
        <div
          class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
        >
          <div class="space-y-5">
            <span class="stage-kicker">Programming Board</span>
            <div>
              <h1 class="stage-title">Show & Event Schedule</h1>
              <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
                Your schedule, queue, and next move across every theater you
                belong to.
              </p>
            </div>

            <!-- Tabs: My Events / Theater Calendar -->
            <div class="flex items-center gap-0">
              <button
                class="border-3 border-(--stage-ink) px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
                :class="
                  activeTab === 'my-events'
                    ? 'bg-(--stage-event) text-(--stage-ink)'
                    : 'bg-(--stage-cream) text-(--stage-ink) hover:bg-(--stage-event-soft)'
                "
                @click="activeTab = 'my-events'"
              >
                My Events
              </button>
              <button
                class="-ml-[3px] border-3 border-(--stage-ink) px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
                :class="
                  activeTab === 'theater-calendar'
                    ? 'bg-(--stage-theater) text-(--stage-ink)'
                    : 'bg-(--stage-cream) text-(--stage-ink) hover:bg-(--stage-theater-soft)'
                "
                @click="activeTab = 'theater-calendar'"
              >
                Theater Calendar
              </button>
            </div>

            <!-- Stats row -->
            <div class="grid gap-3 sm:grid-cols-3">
              <div class="stage-stat">
                <span class="stage-overline">Upcoming</span>
                <span class="stage-stat-value">{{ upcomingCount }}</span>
                <p class="mt-2 text-sm stage-muted">
                  Occurrences still ahead.
                </p>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">Today</span>
                <span class="stage-stat-value">{{ todayCount }}</span>
                <p class="mt-2 text-sm stage-muted">
                  Items on today's board.
                </p>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">Pending review</span>
                <span class="stage-stat-value">{{ pendingReviewCount }}</span>
                <p class="mt-2 text-sm stage-muted">
                  Awaiting theater approval.
                </p>
              </div>
            </div>
          </div>

          <!-- Next Up card -->
          <UCard class="stage-dot-board">
            <template #header>
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="stage-overline">Next up</p>
                  <h2
                    class="mt-2 font-display text-3xl uppercase tracking-[0.08em]"
                  >
                    {{ nextUpItem ? nextUpItem.show.title : "Quiet board" }}
                  </h2>
                </div>
                <UButton
                  color="warning"
                  size="xs"
                  icon="i-heroicons-plus"
                  :to="newShowLink"
                >
                  Propose
                </UButton>
              </div>
            </template>

            <div
              v-if="nextUpItem"
              class="space-y-3 text-sm text-(--stage-ink)"
            >
              <div class="flex flex-wrap items-center gap-2">
                <UBadge color="warning" variant="soft">
                  {{ nextUpItem.show.eventType || "show" }}
                </UBadge>
                <UBadge
                  :color="statusTone(nextUpItem.show.status)"
                  variant="soft"
                >
                  {{ nextUpItem.show.status.replaceAll("_", " ") }}
                </UBadge>
              </div>
              <p class="font-semibold">
                {{ formatDateLabel(nextUpItem.startsAt.slice(0, 10)) }} at
                {{ formatTimeLabel(nextUpItem.startsAt) }}
              </p>
              <p class="stage-muted">
                {{ nextUpItem.show.theaterName }} ·
                {{ nextUpItem.occurrenceStatus.replaceAll("_", " ") }}
              </p>
            </div>

            <div v-else class="space-y-2 text-sm stage-muted">
              <p>No upcoming occurrences match the current filters.</p>
              <p>Try broadening the timeline or create a new show.</p>
            </div>
          </UCard>
        </div>
      </div>
    </StageSection>

    <!-- ═══════════════════════════════════════════════════════════════════
         SECTION 2 — WEEK STRIP (Mobile only)
         Horizontal day selector for the current week
    ═══════════════════════════════════════════════════════════════════ -->
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.72)] lg:hidden"
      inner-class="mx-auto max-w-7xl px-4 py-4 sm:px-6"
    >
      <div class="flex items-center justify-between gap-2">
        <button
          class="flex size-9 shrink-0 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-cream) text-(--stage-ink)"
          @click="jumpWeek(-1)"
        >
          <UIcon name="i-heroicons-chevron-left" class="size-4" />
        </button>

        <div class="flex flex-1 items-center justify-center gap-1">
          <button
            v-for="(day, index) in selectedWeekDays"
            :key="day"
            class="flex flex-1 flex-col items-center gap-0.5 border-2 px-1 py-2 text-center transition-colors"
            :class="
              day === selectedDate
                ? 'border-(--stage-ink) bg-(--stage-event) text-(--stage-ink) shadow-[3px_3px_0_0_var(--stage-ink)]'
                : day === todayDate
                  ? 'border-(--stage-ink) bg-(--stage-event-soft) text-(--stage-ink)'
                  : 'border-transparent text-(--stage-ink) hover:bg-(--stage-paper)'
            "
            @click="selectedDate = day"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider">
              {{ weekdayLabelsMobile[index] }}
            </span>
            <span class="text-sm font-semibold">
              {{ formatDayNumber(day) }}
            </span>
          </button>
        </div>

        <button
          class="flex size-9 shrink-0 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-cream) text-(--stage-ink)"
          @click="jumpWeek(1)"
        >
          <UIcon name="i-heroicons-chevron-right" class="size-4" />
        </button>
      </div>
    </StageSection>

    <!-- ═══════════════════════════════════════════════════════════════════
         SECTION 3 — FILTERS
         Collapsible on mobile, inline on desktop
    ═══════════════════════════════════════════════════════════════════ -->
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.58)]"
      inner-class="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6"
    >
      <!-- Mobile: Toggle + compact -->
      <div class="lg:hidden">
        <div class="flex items-center justify-between gap-3">
          <button
            class="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-(--stage-ink)"
            @click="filtersOpen = !filtersOpen"
          >
            <UIcon
              :name="
                filtersOpen
                  ? 'i-heroicons-chevron-up'
                  : 'i-heroicons-adjustments-horizontal'
              "
              class="size-4"
            />
            Filters
            <span
              v-if="hasActiveFilters"
              class="ml-1 inline-flex size-5 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-event) text-[10px] font-bold"
            >
              !
            </span>
          </button>

          <div class="flex items-center gap-2">
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

        <div v-if="filtersOpen" class="mt-4 grid gap-3 sm:grid-cols-3">
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
          <div v-if="hasActiveFilters">
            <UButton size="xs" variant="ghost" @click="clearFilters">
              Clear filters
            </UButton>
          </div>
        </div>
      </div>

      <!-- Desktop: Full inline filter bar -->
      <div class="hidden lg:block">
        <section class="stage-panel stage-dot-board p-4 sm:p-5">
          <div
            class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end"
          >
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
              <span class="stage-overline">Scope</span>
              <UButton
                v-for="item in timelineItems"
                :key="item.value"
                size="xs"
                :variant="timelineFilter === item.value ? 'soft' : 'ghost'"
                @click="timelineFilter = item.value"
              >
                {{ item.label }}
              </UButton>
              <UButton
                v-if="hasActiveFilters"
                size="xs"
                variant="ghost"
                icon="i-heroicons-x-mark"
                @click="clearFilters"
              >
                Clear
              </UButton>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="error"
        class="mt-4 stage-panel px-5 py-4 text-sm text-red-700"
      >
        {{ error?.data?.message || error?.message }}
      </div>
    </StageSection>

    <!-- ═══════════════════════════════════════════════════════════════════
         SECTION 4 — MOBILE CALL SHEET (mobile only)
         Structured event list for the selected day
    ═══════════════════════════════════════════════════════════════════ -->
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.42)] lg:hidden"
      inner-class="mx-auto max-w-7xl px-4 py-6 sm:px-6"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="stage-overline">Performance Call</p>
        <span class="stage-chip bg-(--stage-paper-strong)">
          {{ selectedDayItems.length }} item{{
            selectedDayItems.length === 1 ? "" : "s"
          }}
        </span>
      </div>

      <div v-if="isLoading" class="text-sm stage-muted">
        Loading schedule…
      </div>

      <div
        v-else-if="!selectedDayItems.length"
        class="border-3 border-dashed border-(--stage-ink) bg-[rgba(251,247,239,0.78)] px-4 py-8 text-center text-sm stage-muted"
      >
        <p class="font-display text-2xl uppercase tracking-[0.06em] text-(--stage-ink)">
          Dark day
        </p>
        <p class="mt-2">
          No events on {{ formattedSelectedDate }}.
        </p>
      </div>

      <!-- Mobile call sheet entries -->
      <div v-else class="space-y-0">
        <NuxtLink
          v-for="(item, index) in selectedDayItems"
          :key="item.occurrenceId"
          :to="showDetailLink(item)"
          class="block border-3 border-(--stage-ink) p-4 transition-colors hover:bg-(--stage-paper)"
          :class="index > 0 ? '-mt-[3px]' : ''"
        >
          <div class="flex items-start gap-4">
            <!-- Time block -->
            <div
              class="shrink-0 border-2 border-(--stage-ink) px-3 py-2 text-center"
              :class="occurrenceToneClass(item)"
            >
              <p class="text-sm font-bold">
                {{ formatTimeLabel(item.startsAt) }}
              </p>
            </div>

            <!-- Event info -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="stage-chip bg-(--stage-paper-strong)" style="padding: 0.15rem 0.5rem; font-size: 0.65rem;">
                  {{ item.show.eventType || "show" }}
                </span>
                <UBadge
                  :color="statusTone(item.show.status)"
                  variant="soft"
                  size="xs"
                >
                  {{ item.show.status.replaceAll("_", " ") }}
                </UBadge>
              </div>
              <h3
                class="mt-2 font-display text-2xl uppercase tracking-[0.06em] leading-tight"
              >
                {{ item.show.title }}
              </h3>
              <p class="mt-1 text-xs stage-muted">
                {{ item.show.theaterName }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </StageSection>

    <!-- ═══════════════════════════════════════════════════════════════════
         SECTION 5 — MAIN CONTENT (Desktop)
         2-column: Monthly Calendar + Weekly Call Sheet
    ═══════════════════════════════════════════════════════════════════ -->
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.42)] hidden lg:block"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div class="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <!-- LEFT: Monthly Calendar -->
        <UCard class="stage-dot-board">
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="stage-overline">Month board</p>
                <h2
                  class="mt-2 font-display text-4xl uppercase tracking-[0.08em]"
                >
                  {{ formattedCurrentMonth }}
                </h2>
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

          <div v-if="isLoading" class="text-sm stage-muted">
            Loading schedule…
          </div>

          <UCalendar
            v-else
            v-model="selectedCalendarDate"
            :month-controls="false"
            :year-controls="false"
            class="rounded-none border-2 border-(--stage-ink) bg-[rgba(251,247,239,0.78)] p-3"
          >
            <template #day="{ day }">
              <div
                class="relative flex min-h-14 w-full items-center justify-center px-1 py-1 text-center"
              >
                <span
                  class="relative z-10 text-sm font-semibold text-(--stage-ink)"
                >
                  {{ day.day }}
                </span>

                <div
                  v-if="calendarDaySummary(calendarDayKey(day)).markers.length"
                  class="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1"
                >
                  <span
                    v-for="marker in calendarDaySummary(calendarDayKey(day))
                      .markers"
                    :key="marker.occurrenceId"
                    class="h-2.5 w-2.5 rounded-full"
                    :class="calendarMarkerClass()"
                  />
                </div>
              </div>
            </template>
          </UCalendar>

          <!-- Selected day summary under calendar -->
          <div class="mt-4 border-t-3 border-(--stage-ink) pt-4">
            <p class="stage-overline stage-muted">Selected</p>
            <p class="mt-1 font-display text-xl uppercase tracking-[0.06em]">
              {{ formattedSelectedDate }}
            </p>
            <p class="mt-1 text-sm stage-muted">
              {{ selectedDayItems.length }} event{{
                selectedDayItems.length === 1 ? "" : "s"
              }}
              on this day.
            </p>
          </div>
        </UCard>

        <!-- RIGHT: Weekly Call Sheet -->
        <UCard class="stage-grid-board">
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="stage-overline">Weekly Call Sheet</p>
                <h2
                  class="mt-2 font-display text-4xl uppercase tracking-[0.08em]"
                >
                  {{ weekDateRange }}
                </h2>
                <p class="mt-2 text-sm stage-muted">
                  Day-by-day view of occurrences landing in the selected week.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-arrow-left"
                  @click="jumpWeek(-1)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  @click="selectedDate = todayDate"
                >
                  This week
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-arrow-right"
                  @click="jumpWeek(1)"
                />
              </div>
            </div>

            <!-- Week day header strip -->
            <div class="mt-4 grid grid-cols-7 gap-0">
              <button
                v-for="(day, index) in selectedWeekDays"
                :key="day"
                class="flex flex-col items-center gap-0.5 border-3 py-2.5 text-center transition-colors"
                :class="[
                  index > 0 ? '-ml-[3px]' : '',
                  day === selectedDate
                    ? 'relative z-10 border-(--stage-ink) bg-(--stage-event) text-(--stage-ink) shadow-[3px_3px_0_0_var(--stage-ink)]'
                    : day === todayDate
                      ? 'border-(--stage-ink) bg-(--stage-event-soft) text-(--stage-ink)'
                      : 'border-(--stage-ink) bg-[rgba(251,247,239,0.72)] text-(--stage-ink) hover:bg-(--stage-paper)',
                ]"
                @click="selectedDate = day"
              >
                <span class="text-[10px] font-bold uppercase tracking-wider">
                  {{ weekdayLabels[index] }}
                </span>
                <span class="text-lg font-semibold leading-tight">
                  {{ formatDayNumber(day) }}
                </span>
                <span
                  v-if="(itemsByDate.get(day) ?? []).length > 0"
                  class="mt-0.5 h-1.5 w-1.5 rounded-full bg-(--stage-ink)"
                />
              </button>
            </div>
          </template>

          <div v-if="isLoading" class="text-sm stage-muted">
            Loading schedule…
          </div>

          <div
            v-else-if="!weekHasItems"
            class="border-3 border-dashed border-(--stage-ink) bg-[rgba(251,247,239,0.78)] px-5 py-8 text-center text-sm stage-muted"
          >
            <p class="font-display text-2xl uppercase tracking-[0.06em] text-(--stage-ink)">
              Dark week
            </p>
            <p class="mt-2">
              No events are scheduled for this week with the current filters.
            </p>
          </div>

          <!-- Week day-by-day entries -->
          <div v-else class="space-y-0">
            <template v-for="weekDay in weekItems" :key="weekDay.date">
              <div
                v-if="weekDay.items.length > 0"
                class="border-b-3 border-(--stage-ink) last:border-b-0"
              >
                <!-- Day header -->
                <div
                  class="flex items-center justify-between gap-3 border-b border-stage-ink/15 px-4 py-2.5"
                  :class="
                    weekDay.date === selectedDate
                      ? 'bg-(--stage-event-soft)'
                      : weekDay.date === todayDate
                        ? 'bg-[rgba(234,165,66,0.12)]'
                        : 'bg-[rgba(251,247,239,0.6)]'
                  "
                >
                  <div class="flex items-center gap-3">
                    <button
                      class="text-sm font-bold text-(--stage-ink) underline decoration-2 underline-offset-2"
                      @click="selectedDate = weekDay.date"
                    >
                      {{ formatWeekdayShort(weekDay.date) }}
                      {{ formatDayNumber(weekDay.date) }}
                    </button>
                    <span
                      v-if="weekDay.date === todayDate"
                      class="stage-chip bg-(--stage-event)"
                      style="padding: 0.1rem 0.5rem; font-size: 0.6rem;"
                    >
                      Today
                    </span>
                  </div>
                  <span class="text-xs font-semibold stage-muted">
                    {{ weekDay.items.length }} event{{
                      weekDay.items.length === 1 ? "" : "s"
                    }}
                  </span>
                </div>

                <!-- Day event entries -->
                <div class="divide-y divide-stage-ink/10">
                  <NuxtLink
                    v-for="item in weekDay.items"
                    :key="item.occurrenceId"
                    :to="showDetailLink(item)"
                    class="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-(--stage-paper)"
                  >
                    <!-- Time -->
                    <div
                      class="w-20 shrink-0 border-2 border-(--stage-ink) px-2 py-1.5 text-center"
                      :class="occurrenceToneClass(item)"
                    >
                      <span class="text-xs font-bold">
                        {{ formatTimeLabel(item.startsAt) }}
                      </span>
                    </div>

                    <!-- Title + meta -->
                    <div class="min-w-0 flex-1">
                      <h4
                        class="truncate font-display text-xl uppercase tracking-[0.06em]"
                      >
                        {{ item.show.title }}
                      </h4>
                      <p class="mt-0.5 text-xs stage-muted">
                        {{ item.show.theaterName }} ·
                        {{ item.show.eventType || "show" }}
                      </p>
                    </div>

                    <!-- Status badge -->
                    <UBadge
                      :color="statusTone(item.show.status)"
                      variant="soft"
                      size="xs"
                      class="shrink-0"
                    >
                      {{ item.show.status.replaceAll("_", " ") }}
                    </UBadge>
                  </NuxtLink>
                </div>
              </div>
            </template>
          </div>
        </UCard>
      </div>
    </StageSection>

    <!-- ═══════════════════════════════════════════════════════════════════
         SECTION 6 — QUICK ACCESS CARDS
         3-column on desktop, stacked on mobile
    ═══════════════════════════════════════════════════════════════════ -->
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.32)]"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Card 1: Next Up (mobile visible too) -->
        <div class="lg:hidden">
          <StageFeatureCard
            title="Next Up"
            subtitle="Your nearest upcoming event"
            tone="bg-(--stage-event-soft)"
          >
            <div v-if="nextUpItem" class="space-y-2">
              <NuxtLink
                :to="showDetailLink(nextUpItem)"
                class="font-display text-2xl uppercase tracking-[0.06em] underline decoration-2 underline-offset-2 hover:text-(--stage-ink)"
              >
                {{ nextUpItem.show.title }}
              </NuxtLink>
              <p class="text-sm">
                {{ formatDateLabel(nextUpItem.startsAt.slice(0, 10)) }} at
                {{ formatTimeLabel(nextUpItem.startsAt) }}
              </p>
              <p class="text-xs stage-muted">
                {{ nextUpItem.show.theaterName }}
              </p>
            </div>
            <p v-else class="text-sm stage-muted">
              No upcoming events.
            </p>
          </StageFeatureCard>
        </div>

        <!-- Card 2: Events by Type -->
        <StageFeatureCard
          title="Event Types"
          subtitle="Breakdown of what's scheduled"
          tone="bg-(--stage-theater-soft)"
        >
          <div
            v-if="(data?.filters.eventTypes ?? []).length > 0"
            class="space-y-2"
          >
            <div
              v-for="eventType in data?.filters.eventTypes ?? []"
              :key="eventType.value"
              class="flex items-center justify-between gap-2 text-sm"
            >
              <span class="font-semibold">{{ eventType.label }}</span>
              <span
                class="border-2 border-(--stage-ink) bg-(--stage-paper-strong) px-2 py-0.5 text-xs font-bold"
              >
                {{
                  allItems.filter(
                    (item) => item.show.eventType === eventType.value,
                  ).length
                }}
              </span>
            </div>
          </div>
          <p v-else class="text-sm stage-muted">
            No event types in the current view.
          </p>
        </StageFeatureCard>

        <!-- Card 3: Theater Quick Links -->
        <StageFeatureCard
          title="Your Theaters"
          subtitle="Quick jump to theater pages"
          tone="bg-(--stage-performer-soft)"
        >
          <div
            v-if="(data?.filters.theaters ?? []).length > 0"
            class="space-y-2"
          >
            <NuxtLink
              v-for="theater in data?.filters.theaters ?? []"
              :key="theater.value"
              :to="`/theaters/${theater.value}`"
              class="flex items-center justify-between gap-2 border-b border-stage-ink/10 pb-2 text-sm last:border-b-0 last:pb-0"
            >
              <span class="font-semibold underline decoration-1 underline-offset-2">
                {{ theater.label }}
              </span>
              <UIcon name="i-heroicons-arrow-right" class="size-3.5 stage-muted" />
            </NuxtLink>
          </div>
          <p v-else class="text-sm stage-muted">
            No theaters in the current view.
          </p>
        </StageFeatureCard>

        <!-- Card 4: Pending Review (shown on lg+ only, replaces Next Up which is desktop hero) -->
        <div class="hidden lg:block">
          <StageFeatureCard
            title="Pending Review"
            subtitle="Shows awaiting approval"
            tone="bg-(--stage-event-soft)"
          >
            <div v-if="pendingReviewCount > 0" class="space-y-2">
              <p class="font-display text-3xl uppercase tracking-[0.06em]">
                {{ pendingReviewCount }}
              </p>
              <p class="text-sm stage-muted">
                {{ pendingReviewCount === 1 ? "Show needs" : "Shows need" }}
                theater review before going live.
              </p>
              <NuxtLink
                to="/review"
                class="inline-block text-sm font-semibold underline decoration-2 underline-offset-2"
              >
                Open approvals queue
              </NuxtLink>
            </div>
            <p v-else class="text-sm stage-muted">
              All shows are reviewed. Nothing pending.
            </p>
          </StageFeatureCard>
        </div>
      </div>
    </StageSection>
  </div>
</template>
