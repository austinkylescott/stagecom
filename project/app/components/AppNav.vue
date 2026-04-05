<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import AppNotificationsBell from "~/components/AppNotificationsBell.vue";
import {
  stageButtonToneClasses,
  type StageButtonTone,
} from "~/utils/stageButtonTone";

const route = useRoute();
const { isAuthed } = useUserIdentity();
const { homeTheater, homePermissions, homeTheaters } = useHomeTheaterState();
const mobileNavOpen = ref(false);

const navItems = computed(() => {
  if (isAuthed.value) {
    return [
      { label: "Schedule", to: "/shows" },
      { label: "Approvals", to: "/review" },
      { label: "People", to: "/performers" },
    ];
  }

  return [
    { label: "Home", to: "/" },
    { label: "Theaters", to: "/theaters" },
    { label: "Performers", to: "/performers" },
  ];
});

const homeTheaterPrimaryTo = computed(() => "/theaters");

const navTone = (to: string): StageButtonTone => {
  if (to.startsWith("/theaters") || to.startsWith("/review")) return "theater";
  if (to.startsWith("/shows")) return "event";
  if (to.startsWith("/performers")) return "performer";

  return "neutral";
};

const desktopNavToneClass = (to: string, active: boolean) =>
  stageButtonToneClasses(navTone(to), active).join(" ");

const desktopNavItems = computed<NavigationMenuItem[]>(() => {
  if (!isAuthed.value) {
    return navItems.value.map((item) => ({
      label: item.label,
      to: item.to,
      active: isActive(item.to),
      class: desktopNavToneClass(item.to, isActive(item.to)),
    }));
  }

  const items: NavigationMenuItem[] = [
    {
      label: "Theaters",
      to: homeTheaterPrimaryTo.value,
      active: isTheaterNavActive.value,
      class: desktopNavToneClass("/theaters", isTheaterNavActive.value),
      children: [
        {
          label: "Open Theater Hub",
          description: "Open your personalized multi-home theater hub.",
          icon: "i-heroicons-building-library",
          to: homeTheaterPrimaryTo.value,
        },
        {
          label: "Browse Shows",
          description: "Open the schedule and browse current show work.",
          icon: "i-heroicons-calendar-days",
          to: "/shows",
        },
      ],
    },
    {
      label: "Schedule",
      to: "/shows",
      active: isActive("/shows"),
      class: desktopNavToneClass("/shows", isActive("/shows")),
    },
    {
      label: "Approvals",
      to: "/review",
      active: isActive("/review"),
      class: desktopNavToneClass("/review", isActive("/review")),
    },
    {
      label: "People",
      to: "/performers",
      active: isActive("/performers"),
      class: desktopNavToneClass("/performers", isActive("/performers")),
    },
  ];

  if (homeTheater.value && homePermissions.value.canReview) {
    items[0].children = [
      ...(items[0].children || []),
      {
        label: "Theater Admin",
        description:
          "Open theater-wide oversight, queue, and community signals.",
        icon: "i-heroicons-shield-check",
        to: `/theaters/${homeTheater.value.slug}/admin`,
      },
    ];
  }

  if (homeTheater.value && homePermissions.value.canCreateShow) {
    items[0].children = [
      ...(items[0].children || []),
      {
        label: "New Show",
        description: "Create a new show inside your home theater.",
        icon: "i-heroicons-plus",
        to: `/theaters/${homeTheater.value.slug}/shows/new`,
      },
    ];
  }

  items[0].children = [
    ...(homeTheaters.value.length
      ? [
          {
            label: homeTheater.value?.name || "Primary Home Theater",
            description: "Jump into the first home theater card directly.",
            icon: "i-heroicons-home",
            to: `/theaters/${homeTheater.value?.slug}`,
          },
        ]
      : []),
    ...(items[0].children || []),
    {
      label: "Browse Theaters",
      description: "Browse all theater communities across Stagecom.",
      icon: "i-heroicons-magnifying-glass",
      to: "/theaters/browse",
    },
  ];

  return items;
});

const isActive = (to: string) => {
  if (to === "/") {
    return route.path === "/";
  }

  return route.path === to || route.path.startsWith(`${to}/`);
};

const isTheaterNavActive = computed(() => route.path.startsWith("/theaters"));

watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false;
  },
);
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b-3 border-(--stage-ink) bg-[rgba(247,241,229,0.94)] supports-backdrop-filter:bg-[rgba(247,241,229,0.86)] backdrop-blur-sm"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 py-3 lg:py-3.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <NuxtLink to="/" class="group flex items-center gap-2">
            <span
              class="font-display text-[1.7rem] leading-none uppercase tracking-[0.12em]"
            >
              Stagecom
            </span>
            <span class="stage-chip bg-(--stage-theater) text-(--stage-ink)">
              Beta
            </span>
          </NuxtLink>
        </div>

        <div
          class="flex items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <nav class="hidden lg:block">
            <UNavigationMenu :items="desktopNavItems" class="justify-start" />
          </nav>

          <div class="flex flex-wrap items-center gap-2 lg:justify-end">
            <UDrawer
              v-model:open="mobileNavOpen"
              direction="bottom"
              title="Stagecom menu"
              description="Primary navigation for moving between Stagecom sections."
              :handle="true"
              :ui="{
                content:
                  'rounded-none border-t-3 border-x-3 border-(--stage-ink) bg-(--stage-cream) shadow-[0_-8px_0_0_var(--stage-ink)]',
                handle: 'bg-(--stage-ink)',
                overlay: 'bg-[rgba(43,41,38,0.45)]',
              }"
            >
              <StageButton
                class="lg:hidden"
                variant="ghost"
                icon="i-heroicons-bars-3-bottom-left"
              >
                Menu
              </StageButton>

              <template #content>
                <div
                  class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6"
                >
                  <div
                    class="flex items-end justify-between gap-3 border-b-3 border-(--stage-ink) pb-4"
                  >
                    <div>
                      <p class="stage-overline">Navigate Stagecom</p>
                      <h2
                        class="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-(--stage-ink)"
                      >
                        Menu
                      </h2>
                    </div>
                    <StageButton
                      variant="ghost"
                      tone="neutral"
                      icon="i-heroicons-x-mark"
                      @click="mobileNavOpen = false"
                    />
                  </div>

                  <nav>
                    <ul class="grid gap-3 sm:grid-cols-2">
                      <li v-if="isAuthed" class="sm:col-span-2">
                        <div
                          class="rounded-none border-3 border-(--stage-ink) bg-[rgba(251,247,239,0.72)] p-3"
                        >
                          <div
                            class="flex items-center justify-between gap-3 border-b-2 border-(--stage-ink) pb-3"
                          >
                            <div>
                              <p class="stage-overline">My theater</p>
                              <p class="mt-1 text-sm stage-muted">
                                {{
                                  homeTheater?.name ||
                                  "No home theaters set yet"
                                }}
                              </p>
                            </div>
                          </div>
                          <div class="mt-3 grid gap-2 sm:grid-cols-2">
                            <StageButton
                              block
                              :to="homeTheaterPrimaryTo"
                              variant="ghost"
                              tone="theater"
                              :active="isTheaterNavActive"
                            >
                              Open Theater Hub
                            </StageButton>
                            <StageButton
                              v-if="homeTheater"
                              block
                              :to="`/theaters/${homeTheater.slug}`"
                              variant="ghost"
                              tone="theater"
                              :active="isTheaterNavActive"
                            >
                              Open Primary Theater
                            </StageButton>
                            <StageButton
                              block
                              to="/shows"
                              variant="ghost"
                              tone="event"
                              :active="isActive('/shows')"
                            >
                              Browse Shows
                            </StageButton>
                            <StageButton
                              v-if="
                                homeTheater && homePermissions.canCreateShow
                              "
                              block
                              :to="`/theaters/${homeTheater.slug}/shows/new`"
                              variant="ghost"
                              tone="theater"
                              :active="isTheaterNavActive"
                            >
                              New Show
                            </StageButton>
                            <StageButton
                              v-if="homeTheater && homePermissions.canReview"
                              block
                              :to="`/theaters/${homeTheater.slug}/admin`"
                              variant="ghost"
                              tone="theater"
                              :active="isTheaterNavActive"
                            >
                              Theater Admin
                            </StageButton>
                            <StageButton
                              block
                              to="/theaters/browse"
                              variant="ghost"
                              tone="theater"
                              :active="isActive('/theaters')"
                            >
                              Browse Theaters
                            </StageButton>
                          </div>
                        </div>
                      </li>
                      <li v-for="item in navItems" :key="`${item.to}-mobile`">
                        <StageButton
                          block
                          :to="item.to"
                          variant="ghost"
                          :tone="navTone(item.to)"
                          :active="isActive(item.to)"
                        >
                          {{ item.label }}
                        </StageButton>
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
