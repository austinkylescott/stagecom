<script setup lang="ts">
import { useRequestHeaders } from "#app";
import TheaterList from "~/components/TheaterList.vue";
import HomeTheaterHero from "~/components/HomeTheaterHero.vue";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useHomeTheaterMutation } from "~/composables/useHomeTheaterMutation";
import { useTheaterSearch } from "~/composables/useTheaterSearch";
import type { Theater, TheatersResponse } from "~/queries/theaters";

const {
  homeTheater,
  homeShows,
  homeCandidates,
  homeMembership,
  homePermissions,
  homeStats,
  homeId,
  hasHome,
} =
  useHomeTheaterState();
const { saveHome } = useHomeTheaterMutation();

const { data: initialTheaters } = await useAsyncData(() =>
  $fetch<TheatersResponse>("/api/theaters", {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
    params: {
      sort: "name_asc",
      page: 1,
      pageSize: 20,
    },
  }),
);

const search = ref("");
const sort = ref<"name_asc" | "recent">("name_asc");
const page = ref(1);

const { data, isLoading, error } = useTheaterSearch(
  {
    search,
    sort,
    page,
  },
  initialTheaters,
);

const myTheaters = computed<Theater[]>(() =>
  (data.value?.myTheaters || []).map((t) => ({
    ...t,
    isMember: true,
    isHome: homeId.value === t.id,
  })),
);

const followingCount = computed(() => myTheaters.value.length);
</script>

<template>
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-end">
        <div class="space-y-4">
          <span class="stage-kicker">Theater hub</span>
          <div>
            <h1 class="stage-section-title">Operate from your home theater.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              Logging in should feel like checking into your theater first. Use this route to see what matters now for your role, then branch into schedule, review, or discovery only when needed.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 lg:justify-self-end">
          <UButton variant="ghost" icon="i-heroicons-magnifying-glass" to="/theaters/browse">
            Browse theaters
          </UButton>
          <UButton color="primary" icon="i-heroicons-plus" to="/theaters/new">
            Create theater
          </UButton>
        </div>
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.5)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <HomeTheaterHero
        :theater="homeTheater"
        :shows="homeShows"
        :candidates="homeCandidates"
        :membership="homeMembership"
        :permissions="homePermissions"
        :stats="homeStats"
        :on-set-home="saveHome"
      />

      <div v-if="error" class="mt-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <TheaterList
          title="Your theaters"
          :theaters="myTheaters"
          :pending="isLoading"
          empty-message="You are not following any theaters yet. Browse theaters to build out the communities you work with."
          primary-label="Open"
          :show-follow="true"
        >
          <template #header>
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p class="stage-overline">Following</p>
                <h2
                  class="mt-2 font-display text-3xl uppercase tracking-[0.08em]"
                >
                  Your theater footprint
                </h2>
                <p class="mt-2 max-w-xl text-sm leading-7 stage-muted">
                  Keep the theater hub focused on the communities you already work with. Use browse when you want to discover or switch context.
                </p>
              </div>
            </div>
          </template>
        </TheaterList>

        <aside class="stage-panel p-5 sm:p-6">
          <p class="stage-overline">Manage theater context</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Keep discovery secondary
          </h2>
          <p class="mt-3 text-sm leading-7 stage-muted">
            Once a home theater is set, this route should stay useful as an operations hub. When you want to discover, join, or switch theaters, step into a dedicated browse flow instead.
          </p>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="stage-stat">
              <span class="stage-overline">Home theater</span>
              <span class="stage-stat-value">{{ hasHome ? "Set" : "Unset" }}</span>
              <p class="mt-2 text-sm stage-muted">
                {{ hasHome ? "Your hub is anchored." : "Choose a home base to make this route fully useful." }}
              </p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Following</span>
              <span class="stage-stat-value">{{ followingCount }}</span>
              <p class="mt-2 text-sm stage-muted">
                Theaters you already belong to or track.
              </p>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <UButton to="/theaters/browse" icon="i-heroicons-magnifying-glass">
              Browse theaters
            </UButton>
            <UButton to="/shows" variant="ghost" icon="i-heroicons-calendar-days">
              Open schedule
            </UButton>
          </div>
        </aside>
      </div>
    </StageSection>
  </div>
</template>
