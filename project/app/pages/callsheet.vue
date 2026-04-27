<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { notificationsPageQueryOptions } from "~/queries/notifications";
import { memberShowsScheduleQueryOptions } from "~/queries/shows";
import { toEventPath } from "~/utils/routes";
import {
  demoCompany,
  demoNotifications,
  demoSchedule,
} from "~/utils/stitchDemo";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const scheduleParams = computed(() => ({
  month: "2026-10",
  theater: "",
  type: "",
  status: "",
  timeline: "upcoming" as const,
  scope: "personal" as const,
}));

const notificationsParams = computed(() => ({
  filter: "all",
  page: 1,
}));

const { data: scheduleData } = useQuery(memberShowsScheduleQueryOptions, scheduleParams);
const { data: notificationsData } = useQuery(notificationsPageQueryOptions, notificationsParams);

const schedule = computed(() =>
  scheduleData.value?.items?.length ? scheduleData.value : demoSchedule,
);
const notifications = computed(() =>
  notificationsData.value?.notifications?.length ? notificationsData.value : demoNotifications,
);

const heroItem = computed(() => schedule.value.items[0] ?? demoSchedule.items[0]);
const upcomingItems = computed(() => schedule.value.items.slice(1, 3));

const formatDay = (value: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(value));
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
const formatRelative = (value: string) => {
  const hours = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)),
  );
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
};
</script>

<template>
  <div class="bg-(--stage-cream) p-4 md:p-8">
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="stitch-display text-5xl font-black md:text-7xl">Callsheet</h1>
        <p class="mt-2 text-lg font-bold text-(--stage-ink)/70">Week 42: Production Cycle Alpha</p>
      </div>

      <div class="flex gap-2">
        <button class="stitch-border bg-(--stage-cream) px-4 py-2 font-display text-lg uppercase">Today</button>
        <button class="stitch-border bg-(--stage-ink) px-4 py-2 font-display text-lg uppercase text-(--stage-cream)">Weekly</button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div class="space-y-6 lg:col-span-8">
        <section class="stitch-border bg-[color:color-mix(in_srgb,var(--stage-paper)_80%,white)] shadow-[6px_6px_0_0_var(--stage-ink)]">
          <header class="flex items-center justify-between border-b-2 border-(--stage-ink) bg-(--stage-event) p-4">
            <h2 class="stitch-display text-xl font-black">Now Playing / Next Up</h2>
            <span class="bg-(--stage-ink) px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-(--stage-cream)">
              Live
            </span>
          </header>

          <div class="p-6">
            <div class="flex flex-col gap-6 md:flex-row">
              <div class="aspect-video w-full overflow-hidden border-2 border-(--stage-ink) bg-(--stage-paper) md:w-1/3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDviTg5TLvsC9ncpsDHjge8dk_E3BgidayWEfovtDbhEFzuwII1jTx7xVPdIOTTUIdx_-MJl3S-M94vZervv2QJrshw-lpnzSrkPFxw0FctGy6VlaZXyYvwykgy5I5Qf-Jrnw4kH2GthvnojBTo8DlT0J-ttSOYdR4VxEJksV1-d9o_r6MZsCv1qd7_4U5iKV7J-Z1_6at8Yil3ELIeCDYFcOcb2--x-uSz6sPJ3RL__SNOYr58Dx-FvZ2MfaUR_NmAzo-2q8KpI8"
                  alt="Stage"
                  class="h-full w-full object-cover grayscale contrast-125"
                >
              </div>

              <div class="flex-1">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <span class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-event)">
                      {{ formatTime(heroItem.startsAt) }} - {{ heroItem.endsAt ? formatTime(heroItem.endsAt) : "TBD" }}
                      {{ heroItem.show.theaterName }}
                    </span>
                    <h3 class="stitch-display mt-1 text-4xl font-black">
                      {{ heroItem.show.title }}
                    </h3>
                  </div>

                  <NuxtLink
                    :to="toEventPath(heroItem.show.theaterSlug, heroItem.show.slug)"
                    class="flex h-12 w-12 items-center justify-center border-2 border-(--stage-ink) hover:bg-(--stage-event)"
                  >
                    ↗
                  </NuxtLink>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span class="border border-(--stage-ink) bg-(--stage-theater) px-2 py-1 text-[10px] font-black uppercase">
                    Cast Check-In: 18:30
                  </span>
                  <span class="border border-(--stage-ink) bg-(--stage-performer-soft) px-2 py-1 text-[10px] font-black uppercase">
                    Lighting: Cue A1-F4
                  </span>
                </div>

                <p class="mt-4 max-w-2xl text-lg leading-relaxed text-(--stage-ink)/80">
                  Nightly long-form improv focusing on dramatic irony. Full cast required for pre-show physical warm-ups.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article
            v-for="(item, index) in upcomingItems"
            :key="item.occurrenceId"
            class="stitch-panel overflow-hidden transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--stage-ink)]"
          >
            <div
              class="h-2 border-b-2 border-(--stage-ink)"
              :class="index === 0 ? 'bg-(--stage-theater)' : 'bg-(--stage-performer)'"
            />
            <div class="p-5">
              <div class="mb-3 flex items-start justify-between">
                <div class="bg-(--stage-ink) px-2 py-1 font-display text-xs uppercase text-(--stage-cream)">
                  {{ formatDay(item.startsAt) }}
                </div>
                <span class="text-xs font-bold">{{ formatTime(item.startsAt) }}</span>
              </div>

              <h4 class="stitch-display mb-2 text-2xl font-black">{{ item.show.title }}</h4>
              <p class="text-sm text-(--stage-ink)/70">
                {{
                  index === 0
                    ? "Exploring the power of pauses in comedic timing with Harold Pinter specialists."
                    : "Quarterly safety inspection and lighting grid realignment. All hands on deck."
                }}
              </p>

              <div class="mt-4 flex items-center justify-between border-t-2 border-(--stage-ink)/10 pt-4">
                <span
                  class="text-[10px] font-black uppercase"
                  :class="index === 0 ? 'text-(--stage-theater)' : 'text-(--stage-performer)'"
                >
                  {{ index === 0 ? "8 participants" : "Mandatory" }}
                </span>
                <NuxtLink :to="toEventPath(item.show.theaterSlug, item.show.slug)">→</NuxtLink>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="space-y-6 lg:col-span-4">
        <section class="stitch-panel bg-[color:color-mix(in_srgb,var(--stage-paper)_92%,black)] p-6 shadow-[4px_4px_0_0_var(--stage-ink)]">
          <h2 class="stitch-display mb-4 border-b-2 border-(--stage-ink) pb-2 text-lg font-black">Urgent Inbound</h2>
          <div class="space-y-4">
            <div
              v-for="(notification, index) in notifications.notifications.slice(0, 2)"
              :key="notification.id"
              class="flex items-start gap-4"
            >
              <div
                class="mt-2 h-2 w-2 shrink-0"
                :class="index === 0 ? 'bg-red-600' : 'bg-(--stage-theater)'"
              />
              <div>
                <p
                  class="text-xs font-black uppercase"
                  :class="index === 0 ? 'text-red-600' : 'text-(--stage-theater)'"
                >
                  {{ notification.payload?.title || notification.type }}
                </p>
                <p class="mt-1 text-sm font-bold">
                  {{ notification.payload?.message || "New notification received." }}
                </p>
                <span class="text-[10px] text-(--stage-ink)/60">
                  {{ formatRelative(notification.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section class="stitch-panel overflow-hidden">
          <header class="border-b-2 border-(--stage-ink) bg-(--stage-theater) p-4">
            <h2 class="stitch-display text-lg font-black">Active Company</h2>
          </header>
          <div>
            <div
              v-for="person in demoCompany"
              :key="person.name"
              class="flex items-center justify-between border-b border-(--stage-ink)/10 p-4 last:border-b-0"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center border-2 border-(--stage-ink) font-black"
                  :class="
                    person.state === 'ready'
                      ? 'bg-(--stage-event-soft)'
                      : person.state === 'warning'
                        ? 'bg-(--stage-performer-soft)'
                        : 'bg-(--stage-theater-soft)'
                  "
                >
                  {{ person.initials }}
                </div>
                <div>
                  <p class="text-sm font-black leading-none">{{ person.name }}</p>
                  <p class="mt-1 text-[10px] font-bold uppercase text-(--stage-ink)/65">{{ person.role }}</p>
                </div>
              </div>

              <span
                class="h-2 w-2 rounded-full"
                :class="
                  person.state === 'ready'
                    ? 'bg-green-600'
                    : person.state === 'warning'
                      ? 'bg-orange-500'
                      : 'bg-gray-400'
                "
              />
            </div>
          </div>
        </section>

        <section class="border-[4px] border-(--stage-ink) bg-(--stage-event) p-6 shadow-[6px_6px_0_0_var(--stage-ink)]">
          <h2 class="stitch-display mb-2 text-2xl font-black">Print Ready</h2>
          <p class="mb-4 text-sm font-bold opacity-80">
            Export this week's callsheet as a physical PDF poster for the bulletin board.
          </p>
          <button class="stitch-display w-full bg-(--stage-ink) py-3 text-lg font-black text-(--stage-cream)">
            Generate PDF
          </button>
        </section>
      </div>
    </div>
  </div>
</template>
