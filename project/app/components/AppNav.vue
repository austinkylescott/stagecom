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
  <header class="sticky top-0 z-50 border-b-3 border-[var(--stage-ink)] bg-[rgba(247,241,229,0.94)] supports-[backdrop-filter]:bg-[rgba(247,241,229,0.86)] backdrop-blur-sm">
    <div class="mx-auto max-w-[92rem] px-3 py-3 sm:px-6 lg:px-8">
      <div class="stage-texture relative py-2">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <NuxtLink
            to="/"
            class="group flex flex-col gap-1 py-1"
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

        <div class="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <nav class="overflow-x-auto pb-1 xl:flex-1">
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

          <div class="flex flex-wrap items-center gap-2 xl:justify-end">
            <div class="hidden items-center gap-2 px-1 py-2 md:flex">
              <span class="stage-overline">Community-first ops</span>
              <span class="size-2.5 border border-[var(--stage-ink)] bg-[var(--stage-gold)]" />
            </div>
            <AppNotificationsBell v-if="isAuthed" />
            <AppAccountMenu />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
