<script setup lang="ts">
const { data, pending, error } = useAsyncData(
  () => $fetch<{ shows: any[] }>("/api/shows", { credentials: "include" }),
  { server: false },
);

const sortedShows = computed(() =>
  (data.value?.shows || []).slice().sort((a, b) => {
    if (!a.nextStartsAt) return 1;
    if (!b.nextStartsAt) return -1;
    return (
      new Date(a.nextStartsAt).getTime() - new Date(b.nextStartsAt).getTime()
    );
  }),
);

const firstTheaterSlug = computed(
  () => data.value?.shows?.[0]?.theaterSlug || "",
);
const newShowLink = computed(() =>
  firstTheaterSlug.value
    ? `/theaters/${firstTheaterSlug.value}/shows/new`
    : "/theaters",
);

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const monthDays = computed(() => {
  const days = [];
  const month = monthStart.getMonth();
  let d = new Date(monthStart);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
});

const occurrencesByDay = computed(() => {
  const map = new Map<string, any[]>();
  for (const show of data.value?.shows || []) {
    if (!show.nextStartsAt) continue;
    const key = new Date(show.nextStartsAt).toISOString().slice(0, 10);
    const arr = map.get(key) || [];
    arr.push(show);
    map.set(key, arr);
  }
  return map;
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Shows</h1>
        <p class="text-slate-600">
          Upcoming shows for theaters you're a member of. Calendar highlights
          the next occurrence per show.
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" :to="newShowLink">
        New show
      </UButton>
    </div>

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>

    <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <UCard>
        <template #header>
          <div class="font-semibold">Upcoming</div>
        </template>

        <div v-if="pending" class="text-sm text-slate-600">Loading...</div>
        <div
          v-else-if="sortedShows.length === 0"
          class="text-sm text-slate-600"
        >
          No shows yet. Join or create a theater, then add a show.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="show in sortedShows"
            :key="show.id"
            class="rounded-lg border border-slate-200 px-4 py-3"
          >
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="font-semibold">{{ show.title }}</p>
                <p class="text-xs text-slate-600">{{ show.theaterName }}</p>
              </div>
              <UBadge :color="show.status === 'approved' ? 'emerald' : 'gray'">
                {{ show.status }}
              </UBadge>
            </div>
            <p class="text-sm text-slate-600 mt-1 line-clamp-2">
              {{ show.description }}
            </p>
            <p class="text-xs text-slate-700 mt-2">
              Next:
              {{
                show.nextStartsAt
                  ? new Date(show.nextStartsAt).toLocaleString()
                  : "TBD"
              }}
            </p>
            <div class="mt-2 flex gap-2">
              <UButton
                size="xs"
                variant="ghost"
                :to="`/theaters/${show.theaterSlug}/review`"
              >
                Review queue
              </UButton>
              <UButton
                size="xs"
                color="primary"
                variant="soft"
                :to="`/theaters/${show.theaterSlug}/shows/new`"
              >
                Add occurrence
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-semibold">This month</div>
        </template>
        <div class="grid grid-cols-7 gap-2 text-xs">
          <div
            class="text-slate-500 text-center"
            v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="d"
          >
            {{ d }}
          </div>
          <div
            v-for="day in monthDays"
            :key="day.toISOString()"
            class="border border-slate-200 rounded-md min-h-18 p-2 flex flex-col gap-1"
          >
            <div class="text-slate-700 font-medium">{{ day.getDate() }}</div>
            <div class="flex flex-col gap-1">
              <template
                v-for="occ in occurrencesByDay.get(
                  day.toISOString().slice(0, 10),
                ) || []"
                :key="occ.id"
              >
                <UBadge size="xs" color="blue" variant="soft" class="truncate">
                  {{ occ.title }}
                </UBadge>
              </template>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
