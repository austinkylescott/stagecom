<script setup lang="ts">
import { toNotificationsPath, toProfilePath, toTheatersPath } from "~/utils/routes";

const route = useRoute();
const links = computed(() => [
  { label: "Home", to: "/" },
  { label: "Theaters", to: toTheatersPath() },
  { label: "Features", to: "/dev/components" },
]);

const { isAuthed } = useUserIdentity();
</script>

<template>
  <header
    class="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-[4px] border-(--stage-ink) bg-(--stage-theater) px-6 text-(--stage-ink)"
  >
    <div class="flex items-center gap-8">
      <NuxtLink to="/" class="stitch-display text-2xl font-black">Stagecom</NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="stitch-nav-label px-2 text-lg"
          :class="route.path === link.to ? 'stitch-link-active' : 'stitch-link'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>

    <div class="flex items-center gap-3">
      <NuxtLink
        v-if="isAuthed"
        :to="toNotificationsPath()"
        class="flex h-9 w-9 items-center justify-center border-2 border-transparent hover:border-(--stage-ink) hover:bg-(--stage-paper)"
      >
        <span class="text-lg">?</span>
      </NuxtLink>

      <NuxtLink
        :to="isAuthed ? toProfilePath() : '/login'"
        class="flex h-9 w-9 items-center justify-center border-2 border-transparent hover:border-(--stage-ink) hover:bg-(--stage-paper)"
      >
        <span class="text-lg">●</span>
      </NuxtLink>
    </div>
  </header>
</template>
