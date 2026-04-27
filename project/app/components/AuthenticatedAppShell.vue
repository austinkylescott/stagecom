<script setup lang="ts">
import { resolveAppShellRouteKind } from "~/utils/appShell";
import {
  toCallsheetPath,
  toEventCreatePath,
  toNotificationsPath,
  toProfilePath,
  toTheatersPath,
} from "~/utils/routes";

const route = useRoute();

const routeKind = computed(() => resolveAppShellRouteKind(route.path));
const theaterSlug = computed(() =>
  typeof route.params.theaterSlug === "string" ? route.params.theaterSlug : null,
);
const newEventPath = computed(() => toEventCreatePath(theaterSlug.value));

const navItems = computed(() => [
  {
    label: "Callsheet",
    to: toCallsheetPath(),
    active: routeKind.value === "callsheet",
  },
  {
    label: "Theaters",
    to: toTheatersPath(),
    active:
      routeKind.value === "theater" ||
      routeKind.value === "admin" ||
      routeKind.value === "event" ||
      routeKind.value === "event-new",
  },
  {
    label: "Notifications",
    to: toNotificationsPath(),
    active: routeKind.value === "notifications",
  },
  {
    label: "Profile",
    to: toProfilePath(),
    active: routeKind.value === "profile",
  },
]);
</script>

<template>
  <div class="min-h-screen bg-(--stage-cream) text-(--stage-ink)">
    <header
      class="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-[4px] border-(--stage-ink) bg-(--stage-theater) px-6"
    >
      <div class="flex items-center gap-8">
        <NuxtLink to="/callsheet" class="stitch-display text-2xl font-black">Stagecom</NuxtLink>

        <nav class="hidden h-full items-center gap-8 md:flex">
          <NuxtLink
            v-for="item in navItems.slice(0, 3)"
            :key="item.to"
            :to="item.to"
            class="stitch-nav-label flex h-full items-center px-2 text-lg"
            :class="item.active ? 'stitch-link-active' : 'stitch-link'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <NuxtLink
          :to="toProfilePath()"
          class="flex h-9 w-9 items-center justify-center hover:bg-(--stage-paper)"
        >
          <span class="text-lg">⚙</span>
        </NuxtLink>
        <NuxtLink
          :to="toNotificationsPath()"
          class="flex h-9 w-9 items-center justify-center hover:bg-(--stage-paper)"
        >
          <span class="text-lg">?</span>
        </NuxtLink>
      </div>
    </header>

    <div class="flex min-h-screen pt-16">
      <aside
        class="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col gap-4 border-r-[4px] border-(--stage-ink) bg-(--stage-cream) p-6 shadow-[4px_0_0_0_var(--stage-ink)] md:flex"
      >
        <div class="mb-6">
          <h1 class="stitch-display text-4xl font-black">Stagecom</h1>
          <p class="stitch-nav-label text-sm text-(--stage-ink)/70">The Analog Stage</p>
        </div>

        <nav class="flex flex-col gap-3">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="stitch-nav-label flex items-center gap-3 p-3 text-lg transition-all"
            :class="
              item.active
                ? 'border-2 border-(--stage-ink) bg-(--stage-theater) shadow-[4px_4px_0_0_var(--stage-ink)]'
                : 'border-2 border-transparent hover:border-(--stage-ink) hover:bg-(--stage-paper) hover:-translate-x-0.5 hover:-translate-y-0.5'
            "
          >
            <span class="text-sm">■</span>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <NuxtLink
          :to="newEventPath"
          class="mt-auto flex items-center justify-center border-2 border-(--stage-ink) bg-(--stage-event) px-4 py-4 text-center text-sm font-black uppercase shadow-[4px_4px_0_0_var(--stage-ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
        >
          New Event
        </NuxtLink>
      </aside>

      <main class="min-w-0 flex-1 bg-(--stage-cream) pb-24 md:pb-0">
        <slot />
      </main>
    </div>

    <nav
      class="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t-[4px] border-(--stage-ink) bg-(--stage-paper) md:hidden"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex h-full flex-1 flex-col items-center justify-center px-2 text-(--stage-ink)"
        :class="item.active ? 'border-x-2 border-(--stage-ink) bg-(--stage-event)' : ''"
      >
        <span class="mb-1 text-base">■</span>
        <span class="text-[10px] font-black uppercase">
          {{ item.label === "Notifications" ? "Inbound" : item.label }}
        </span>
      </NuxtLink>
    </nav>

    <NuxtLink
      :to="newEventPath"
      class="fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center border-[4px] border-(--stage-ink) bg-(--stage-event) text-3xl font-black shadow-[6px_6px_0_0_var(--stage-ink)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--stage-ink)] md:bottom-12 md:right-12"
    >
      +
    </NuxtLink>
  </div>
</template>
