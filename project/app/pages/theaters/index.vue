<script setup lang="ts">
import TheaterList from "~/components/TheaterList.vue";
import HomeTheaterHero from "~/components/HomeTheaterHero.vue";
import HomeTheaterPrompt from "~/components/HomeTheaterPrompt.vue";
import HomeTheaterLeavePrompt from "~/components/HomeTheaterLeavePrompt.vue";
import { useMembershipToggle } from "~/composables/useMembershipToggle";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useTheaterSearchPage } from "~/composables/useTheaterSearchPage";
import { useTheaterMembershipManager } from "~/composables/useTheaterMembershipManager";

const {
  homeTheater,
  homeShows,
  homeCandidates,
  homeId,
  hasHome,
  refreshHome,
  saveHome,
} = useHomeTheaterState();

const {
  search,
  sort,
  page,
  pending,
  error,
  refresh: refreshSearch,
  myTheaters,
  allTheaters,
  totalPages,
  showPagination,
  mutateMembership,
} = useTheaterSearchPage(homeId);

const { toggleMembership } = useMembershipToggle();

const refreshLists = async () => {
  // Keep both search results and home theater data in sync after membership changes
  await Promise.all([refreshSearch(), refreshHome()]);
};

const {
  membershipBusyIds,
  homeBusyIds,
  showHomeModal,
  pendingHomeTheater,
  settingHome,
  showLeaveHomeModal,
  pendingLeaveTheater,
  leavingHome,
  handleToggle,
  handleHome,
  confirmHomeChoice,
  confirmLeaveHome,
  cancelLeaveHome,
} = useTheaterMembershipManager({
  hasHome,
  homeId,
  toggleMembership,
  setHome: saveHome,
  refreshAll: refreshLists,
  mutateMembership,
});

const handleMembershipChanged = (payload: {
  theaterId: string;
  isMember: boolean;
  isHome: boolean;
}) => {
  const theater = { id: payload.theaterId } as any;
  mutateMembership(theater, payload.isMember);
  refreshLists();
};
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Theaters</h1>
        <p class="text-slate-600">
          Browse all theaters and the ones you're part of.
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" to="/theaters/new"
        >Create theater</UButton
      >
    </div>

    <HomeTheaterHero
      :theater="homeTheater"
      :shows="homeShows"
      :candidates="homeCandidates"
      :on-set-home="saveHome"
    />

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <TheaterList
        title="Following"
        :theaters="myTheaters"
        :pending="pending"
        empty-message="You're not a member yet. Follow or create a theater to see it here."
        primary-label="Open"
        :show-follow="true"
        :loading-ids="membershipBusyIds"
        :home-loading-ids="homeBusyIds"
        @toggle="(action, theater) => handleToggle(action, theater)"
        @home="(action, theater) => handleHome(action, theater)"
        @membership-changed="handleMembershipChanged"
      />

      <TheaterList
        title="All theaters"
        :theaters="allTheaters"
        :pending="pending"
        primary-label="View"
        :show-follow="true"
        :loading-ids="membershipBusyIds"
        :home-loading-ids="homeBusyIds"
        @toggle="(action, theater) => handleToggle(action, theater)"
        @home="(action, theater) => handleHome(action, theater)"
        @membership-changed="handleMembershipChanged"
      >
        <template #header>
          <div class="flex flex-col gap-3 w-full">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <p class="font-semibold">All theaters</p>
              <div class="flex gap-2 flex-wrap">
                <UInput
                  v-model="search"
                  icon="i-heroicons-magnifying-glass"
                  placeholder="Search theaters"
                  class="w-full sm:w-64"
                />
                <USelect
                  v-model="sort"
                  :options="[
                    { label: 'Name A→Z', value: 'name_asc' },
                    { label: 'Recently added', value: 'recent' },
                    { label: 'Next show soonest', value: 'next_show' },
                  ]"
                  class="w-full sm:w-48"
                />
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="pt-4">
            <UPagination
              v-if="showPagination"
              :page="page"
              :total="totalPages"
              :items-per-page="1"
              :disabled="pending"
              :show-controls="true"
              @update:page="(p) => (page = p)"
            />
          </div>
        </template>
      </TheaterList>
    </div>

    <HomeTheaterPrompt
      v-model="showHomeModal"
      :theater-name="pendingHomeTheater?.name || 'This theater'"
      :loading="settingHome"
      @confirm="confirmHomeChoice(true)"
      @cancel="confirmHomeChoice(false)"
    />

    <HomeTheaterLeavePrompt
      v-model="showLeaveHomeModal"
      :theater-name="pendingLeaveTheater?.name || 'This theater'"
      :loading="leavingHome"
      @confirm="confirmLeaveHome"
      @cancel="cancelLeaveHome"
    />
  </div>
</template>
