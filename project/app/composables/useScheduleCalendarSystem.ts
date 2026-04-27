import { CalendarDate } from "@internationalized/date";
import { computed } from "vue";
import type { ComputedRef, Ref } from "vue";

export type ScheduleCalendarItem = {
  occurrenceId: string;
  startsAt: string;
  endsAt: string | null;
  occurrenceStatus: string;
  viewerRelationships: string[];
  show: {
    id: string;
    title: string;
    status: string;
    eventType: string | null;
    theaterName: string;
    theaterSlug: string;
  };
};

export type ScheduleWeekGroup<T extends ScheduleCalendarItem> = {
  date: string;
  items: T[];
};

export const schedulePad = (value: number) =>
  value.toString().padStart(2, "0");

export const toScheduleIsoDate = (date: Date) =>
  `${date.getFullYear()}-${schedulePad(date.getMonth() + 1)}-${schedulePad(
    date.getDate(),
  )}`;

export const toScheduleMonthKey = (date: Date) =>
  `${date.getFullYear()}-${schedulePad(date.getMonth() + 1)}`;

export const parseScheduleIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toScheduleCalendarDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new CalendarDate(year, month, day);
};

export const fromScheduleCalendarDate = (value: CalendarDate) =>
  `${value.year}-${schedulePad(value.month)}-${schedulePad(value.day)}`;

export const formatScheduleMonthLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(parseScheduleIsoDate(`${value}-01`));

export const formatScheduleDateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseScheduleIsoDate(value));

export const formatScheduleShortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parseScheduleIsoDate(value));

export const formatScheduleTimeLabel = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const formatScheduleWeekdayShort = (value: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    parseScheduleIsoDate(value),
  );

export const formatScheduleDayNumber = (value: string) =>
  parseScheduleIsoDate(value).getDate();

export const isScheduleMonth = (value: string) =>
  /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export const isScheduleDate = (value: string) =>
  /^\d{4}-(0[1-9]|1[0-2])-[0-3]\d$/.test(value);

export const getScheduleQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : value || "";

export const resolveScheduleMonth = (value: string, fallbackMonth: string) =>
  isScheduleMonth(value) ? value : fallbackMonth;

export const resolveScheduleDate = (
  month: string,
  value: string,
  todayMonth: string,
  todayDate: string,
) =>
  isScheduleDate(value) && value.startsWith(`${month}-`)
    ? value
    : month === todayMonth
      ? todayDate
      : `${month}-01`;

export const useScheduleCalendarSystem = <T extends ScheduleCalendarItem>(
  items: ComputedRef<T[]> | Ref<T[]>,
  selectedDate: Ref<string>,
) => {
  const now = new Date();
  const todayDate = toScheduleIsoDate(now);

  const selectedCalendarDate = computed<CalendarDate>({
    get: () => toScheduleCalendarDate(selectedDate.value),
    set: (value) => {
      selectedDate.value = fromScheduleCalendarDate(value);
    },
  });

  const currentMonth = computed(() => selectedDate.value.slice(0, 7));
  const formattedSelectedDate = computed(() =>
    formatScheduleDateLabel(selectedDate.value),
  );
  const formattedCurrentMonth = computed(() =>
    formatScheduleMonthLabel(currentMonth.value),
  );

  const itemsByDate = computed(() => {
    const map = new Map<string, T[]>();

    for (const item of items.value) {
      const key = item.startsAt.slice(0, 10);
      const dayItems = map.get(key) ?? [];
      dayItems.push(item);
      map.set(key, dayItems);
    }

    for (const dayItems of map.values()) {
      dayItems.sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
      );
    }

    return map;
  });

  const selectedDayItems = computed(
    () => itemsByDate.value.get(selectedDate.value) ?? [],
  );

  const agendaItems = computed(() =>
    items.value
      .slice()
      .sort(
        (left, right) =>
          new Date(left.startsAt).getTime() -
          new Date(right.startsAt).getTime(),
      ),
  );

  const upcomingItems = computed(() =>
    items.value
      .filter((item) => new Date(item.startsAt).getTime() >= Date.now())
      .sort(
        (left, right) =>
          new Date(left.startsAt).getTime() -
          new Date(right.startsAt).getTime(),
      ),
  );

  const selectedWeekDays = computed(() => {
    const date = parseScheduleIsoDate(selectedDate.value);
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return toScheduleIsoDate(day);
    });
  });

  const weekDateRange = computed(() => {
    const days = selectedWeekDays.value;
    return `${formatScheduleShortDate(days[0])} - ${formatScheduleShortDate(
      days[6],
    )}`;
  });

  const weekItems = computed<ScheduleWeekGroup<T>[]>(() =>
    selectedWeekDays.value.map((date) => ({
      date,
      items: itemsByDate.value.get(date) ?? [],
    })),
  );

  const weekHasItems = computed(() =>
    weekItems.value.some((day) => day.items.length > 0),
  );

  const calendarMarkerCounts = computed(() =>
    Object.fromEntries(
      Array.from(itemsByDate.value.entries()).map(([date, dayItems]) => [
        date,
        dayItems.length,
      ]),
    ),
  );

  const jumpWeek = (direction: -1 | 1) => {
    const date = parseScheduleIsoDate(selectedDate.value);
    date.setDate(date.getDate() + direction * 7);
    selectedDate.value = toScheduleIsoDate(date);
  };

  const jumpMonth = (direction: -1 | 1) => {
    const current = parseScheduleIsoDate(`${currentMonth.value}-01`);
    const next = new Date(
      current.getFullYear(),
      current.getMonth() + direction,
      1,
    );
    selectedDate.value = toScheduleIsoDate(next);
  };

  return {
    agendaItems,
    calendarMarkerCounts,
    currentMonth,
    formattedCurrentMonth,
    formattedSelectedDate,
    itemsByDate,
    jumpMonth,
    jumpWeek,
    selectedCalendarDate,
    selectedDayItems,
    selectedWeekDays,
    todayDate,
    upcomingItems,
    weekDateRange,
    weekHasItems,
    weekItems,
  };
};
