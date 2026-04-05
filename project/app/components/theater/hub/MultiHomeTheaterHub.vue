<script setup lang="ts">
import HomeTheaterCandidateList from "~/components/theater/hub/HomeTheaterCandidateList.vue";
import HomeTheaterDashboardCard from "~/components/theater/hub/HomeTheaterDashboardCard.vue";
import type { HomeTheater, HomeTheaterSummary } from "~/queries/home";

defineProps<{
  candidateTheaters: HomeTheater[];
  homeTheaters: HomeTheaterSummary[];
}>();

const emit = defineEmits<{
  (e: "add-home", theaterId: string): void;
  (e: "remove-home", theaterId: string): void;
}>();
</script>

<template>
  <div class="space-y-6">
    <template v-if="homeTheaters.length">
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="stage-stat bg-[rgba(130,191,182,0.22)]">
          <span class="stage-overline">Home theaters</span>
          <span class="stage-stat-value">{{ homeTheaters.length }}</span>
          <p class="mt-2 text-sm stage-muted">
            Theater dashboards anchored in your steady-state rotation.
          </p>
        </div>
        <div class="stage-stat bg-[rgba(234,165,66,0.18)]">
          <span class="stage-overline">Candidate theaters</span>
          <span class="stage-stat-value">{{ candidateTheaters.length }}</span>
          <p class="mt-2 text-sm stage-muted">
            Active member theaters you can add without changing membership.
          </p>
        </div>
        <div class="stage-stat bg-[rgba(199,96,86,0.14)]">
          <span class="stage-overline">Hub mode</span>
          <span class="stage-stat-value">Multi-home</span>
          <p class="mt-2 text-sm stage-muted">
            Browse stays secondary while this route keeps theater context front and center.
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <HomeTheaterDashboardCard
          v-for="entry in homeTheaters"
          :key="entry.theater.id"
          :entry="entry"
          @remove-home="emit('remove-home', $event)"
        />
      </div>

      <HomeTheaterCandidateList
        :theaters="candidateTheaters"
        title="Add another home theater"
        description="Pin any active-member theater here so the hub can show its dashboard without making discovery the default route."
        @add-home="emit('add-home', $event)"
      />
    </template>

    <template v-else>
      <UCard
        :ui="{
          root: 'rounded-none border-3 border-(--stage-ink) bg-[rgba(251,247,239,0.92)] shadow-[6px_6px_0_0_var(--stage-ink)]',
          header: 'p-5 sm:p-6',
          body: 'p-5 pt-0 sm:p-6 sm:pt-0',
        }"
      >
        <template #header>
          <div>
            <p class="stage-overline">No home theaters yet</p>
            <h2 class="mt-2 font-display text-5xl uppercase tracking-[0.08em] text-(--stage-ink)">
              Start The Hub
            </h2>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              Home theaters turn this route into a personalized board instead of a directory. Pin the theaters you actively work with, then step into browse only when you need discovery.
            </p>
          </div>
        </template>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="stage-stat bg-[rgba(130,191,182,0.22)]">
            <span class="stage-overline">State</span>
            <span class="stage-stat-value">No homes</span>
            <p class="mt-2 text-sm stage-muted">Choose from existing member theaters or create one.</p>
          </div>
          <div class="stage-stat bg-[rgba(234,165,66,0.18)]">
            <span class="stage-overline">Eligible theaters</span>
            <span class="stage-stat-value">{{ candidateTheaters.length }}</span>
            <p class="mt-2 text-sm stage-muted">Active theater memberships available for pinning.</p>
          </div>
          <div class="stage-stat bg-[rgba(199,96,86,0.14)]">
            <span class="stage-overline">Discovery</span>
            <span class="stage-stat-value">Secondary</span>
            <p class="mt-2 text-sm stage-muted">Use browse intentionally instead of making it the default theater surface.</p>
          </div>
        </div>
      </UCard>

      <HomeTheaterCandidateList
        :theaters="candidateTheaters"
        title="Mark member theaters as home"
        description="A theater can only become home if you already belong there. This toggle does not create membership or upgrade your role."
        @add-home="emit('add-home', $event)"
      />
    </template>
  </div>
</template>
