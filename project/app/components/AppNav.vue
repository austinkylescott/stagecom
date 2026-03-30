<script setup lang="ts">
import AppNotificationsBell from "~/components/AppNotificationsBell.vue";

const route = useRoute();
const { isAuthed } = useUserIdentity();
const mobileNavOpen = ref(false);

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
      { label: "Profile", to: "/profile" },
    );
  }

  return items;
});

const navToneClasses = (to: string, active: boolean) => {
  const shared = "!text-[var(--stage-ink)]";

  if (to.startsWith("/theaters") || to.startsWith("/review")) {
    return [
      active
        ? "bg-[var(--stage-theater)] hover:bg-[var(--stage-theater-soft)] active:bg-[var(--stage-theater-soft)]"
        : "bg-[rgba(251,247,239,0.78)] hover:bg-[var(--stage-theater-soft)] active:bg-[var(--stage-theater-soft)]",
      shared,
    ];
  }

  if (to.startsWith("/shows")) {
    return [
      active
        ? "bg-[var(--stage-event)] hover:bg-[var(--stage-event-soft)] active:bg-[var(--stage-event-soft)]"
        : "bg-[rgba(251,247,239,0.78)] hover:bg-[var(--stage-event-soft)] active:bg-[var(--stage-event-soft)]",
      shared,
    ];
  }

  if (to.startsWith("/performers") || to.startsWith("/profile")) {
    return [
      active
        ? "bg-[var(--stage-performer)] hover:bg-[var(--stage-performer-soft)] active:bg-[var(--stage-performer-soft)]"
        : "bg-[rgba(251,247,239,0.78)] hover:bg-[var(--stage-performer-soft)] active:bg-[var(--stage-performer-soft)]",
      shared,
    ];
  }

  return [
    active ? "bg-[var(--stage-paper-strong)]" : "bg-[rgba(251,247,239,0.78)] hover:bg-[var(--stage-paper)]",
    shared,
  ];
};

const isActive = (to: string) => {
  if (to === "/") {
    return route.path === "/";
  }

  return route.path === to || route.path.startsWith(`${to}/`);
};

watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false;
  },
);
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b-3 border-[var(--stage-ink)] bg-[rgba(247,241,229,0.94)] supports-[backdrop-filter]:bg-[rgba(247,241,229,0.86)] backdrop-blur-sm"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 py-3 lg:py-3.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <NuxtLink to="/" class="group flex items-center gap-2">
            <span class="font-display text-[1.7rem] leading-none uppercase tracking-[0.12em]">
              Stagecom
            </span>
            <span class="stage-chip bg-[var(--stage-theater)] text-[var(--stage-ink)]">
              Beta
            </span>
          </NuxtLink>
        </div>

        <div class="flex items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto] lg:items-center">
          <nav class="hidden lg:block">
            <ul class="flex flex-wrap items-center gap-2">
              <li v-for="item in navItems" :key="item.to">
                <UButton
                  :to="item.to"
                  :variant="isActive(item.to) ? 'soft' : 'ghost'"
                  :class="navToneClasses(item.to, isActive(item.to))"
                >
                  {{ item.label }}
                </UButton>
              </li>
            </ul>
          </nav>

          <div class="flex flex-wrap items-center gap-2 lg:justify-end">
            <UDrawer
              v-model:open="mobileNavOpen"
              direction="bottom"
              title="Stagecom menu"
              description="Primary navigation for moving between Stagecom sections."
              :handle="true"
              :ui="{
                content: 'rounded-none border-t-3 border-x-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] shadow-[0_-8px_0_0_var(--stage-ink)]',
                handle: 'bg-[var(--stage-ink)]',
                overlay: 'bg-[rgba(43,41,38,0.45)]'
              }"
            >
              <UButton
                class="lg:hidden"
                variant="ghost"
                icon="i-heroicons-bars-3-bottom-left"
              >
                Menu
              </UButton>

              <template #content>
                <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
                  <div class="flex items-end justify-between gap-3 border-b-3 border-[var(--stage-ink)] pb-4">
                    <div>
                      <p class="stage-overline">Navigate Stagecom</p>
                      <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-[var(--stage-ink)]">
                        Menu
                      </h2>
                    </div>
                    <UButton variant="ghost" icon="i-heroicons-x-mark" @click="mobileNavOpen = false" />
                  </div>

                  <nav>
                    <ul class="grid gap-3 sm:grid-cols-2">
                      <li v-for="item in navItems" :key="`${item.to}-mobile`">
                        <UButton
                          block
                          :to="item.to"
                          :variant="isActive(item.to) ? 'soft' : 'ghost'"
                          :class="navToneClasses(item.to, isActive(item.to))"
                        >
                          {{ item.label }}
                        </UButton>
                      </li>
                    </ul>
                  </nav>
                </div>
              </template>
            </UDrawer>
            <AppNotificationsBell v-if="isAuthed" />
            <AppAccountMenu />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
