<script setup lang="ts">
import {
  toCallsheetPath,
  toNotificationsPath,
  toProfilePath,
  toTheatersPath,
} from "~/utils/routes";

const { isAuthed } = useUserIdentity();
const route = useRoute();

const mobileLinks = computed(() => [
  { label: "Callsheet", to: isAuthed.value ? toCallsheetPath() : "/login" },
  { label: "Theaters", to: isAuthed.value ? toTheatersPath() : "/login" },
  { label: "Inbound", to: isAuthed.value ? toNotificationsPath() : "/login" },
  { label: "Me", to: isAuthed.value ? toProfilePath() : "/login" },
]);
</script>

<template>
  <footer
    class="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t-[4px] border-(--stage-ink) bg-(--stage-paper) md:hidden"
  >
    <NuxtLink
      v-for="link in mobileLinks"
      :key="link.label"
      :to="link.to"
      class="flex h-full flex-1 flex-col items-center justify-center px-3 text-(--stage-ink)"
      :class="route.path === link.to ? 'bg-(--stage-event) border-x-2 border-(--stage-ink)' : ''"
    >
      <span class="mb-1 text-base">■</span>
      <span class="text-[10px] font-black uppercase">{{ link.label }}</span>
    </NuxtLink>
  </footer>
</template>
