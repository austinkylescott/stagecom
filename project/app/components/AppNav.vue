<script setup lang="ts">
import AppNotificationsBell from "~/components/AppNotificationsBell.vue";

const route = useRoute();
const { isAuthed } = useUserIdentity();

const navItems = computed(() => {
  const items = [
    { label: "Home", to: "/" },
    { label: "Theaters", to: "/theaters" },
    { label: "Performers", to: "/performers" },
  ];

  if (isAuthed.value) {
    items.push(
      { label: "Shows", to: "/shows" },
      { label: "Review", to: "/review" },
      { label: "Notifications", to: "/notifications" },
      { label: "Profile", to: "/profile" },
    );
  }

  return items;
});

const isActive = (to: string) => {
  if (to === "/") {
    return route.path === "/";
  }

  return route.path === to || route.path.startsWith(`${to}/`);
};
</script>

<template>
  <header class="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
    <div
      class="stage-frame stage-texture relative overflow-hidden rounded-[2rem] px-4 py-4 sm:px-6"
    >
      <div
        class="absolute inset-x-0 top-0 h-3 border-b-[3px] border-[var(--stage-ink)] bg-[var(--stage-coral)]"
      />

      <div
        class="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex items-start justify-between gap-4">
          <NuxtLink
            to="/"
            class="group flex flex-col gap-1 rounded-[1.4rem] border-[3px] border-[var(--stage-ink)] bg-[var(--stage-paper)] px-4 py-3 shadow-[6px_6px_0_0_var(--stage-ink)]"
          >
            <div class="flex items-center gap-2">
              <span class="stage-overline">Stagecom</span>
              <span class="stage-chip bg-[var(--stage-mint)] text-[var(--stage-ink)]"
                >Beta</span
              >
            </div>
            <span
              class="font-display text-3xl uppercase tracking-[0.12em] leading-none"
            >
              Run Your Scene
            </span>
          </NuxtLink>

          <div class="hidden xl:flex items-center gap-3">
            <span class="stage-kicker">Built With The Community</span>
          </div>
        </div>

        <div class="flex flex-col gap-3 lg:items-end">
          <nav class="overflow-x-auto pb-1">
            <ul class="flex min-w-max items-center gap-2">
              <li v-for="item in navItems" :key="item.to">
                <UButton
                  :to="item.to"
                  :variant="isActive(item.to) ? 'soft' : 'ghost'"
                  :class="
                    isActive(item.to)
                      ? 'bg-[var(--stage-mint)]'
                      : 'bg-[rgba(251,247,239,0.72)]'
                  "
                >
                  {{ item.label }}
                </UButton>
              </li>
            </ul>
          </nav>

          <div class="flex flex-wrap items-center justify-end gap-2">
            <div
              class="hidden md:flex items-center gap-2 rounded-full border-[3px] border-[var(--stage-ink)] bg-[var(--stage-paper)] px-3 py-2"
            >
              <span class="stage-overline">Community-first ops</span>
              <span class="h-2.5 w-2.5 rounded-full bg-[var(--stage-gold)]" />
            </div>
            <AppNotificationsBell v-if="isAuthed" />
            <AppAccountMenu />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
