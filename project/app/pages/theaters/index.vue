<script setup lang="ts">
import { useRequestHeaders } from "#app";
import TheaterList from "~/components/TheaterList.vue";
import HomeTheaterHero from "~/components/HomeTheaterHero.vue";
import HomeTheaterPrompt from "~/components/HomeTheaterPrompt.vue";
import HomeTheaterLeavePrompt from "~/components/HomeTheaterLeavePrompt.vue";
import { useMembershipToggle } from "~/composables/useMembershipToggle";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useHomeTheaterMutation } from "~/composables/useHomeTheaterMutation";
import { useSearchQuery } from "~/composables/useSearchQuery";
import { useTheaterSearch } from "~/composables/useTheaterSearch";
import type { Theater, TheatersResponse } from "~/queries/theaters";
import { ref } from "vue";

type TheaterLike = {
  id?: string;
  slug?: string;
  name?: string;
  isMember?: boolean;
};

const { homeTheater, homeShows, homeCandidates, homeId, hasHome } =
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

const {
  searchInput: search,
  search: debouncedSearch,
  sort,
  page,
} = useSearchQuery<"name_asc" | "recent">({
  initialSort: "name_asc",
  debounce: 300,
  maxWait: 800,
});

const { data, isLoading, error, refresh } = useTheaterSearch(
  {
    search: debouncedSearch,
    sort,
    page,
  },
  initialTheaters,
);

const { toggleMembership } = useMembershipToggle();

const myTheaters = computed<Theater[]>(() =>
  (data.value?.myTheaters || []).map((t) => ({
    ...t,
    isMember: true,
    isHome: homeId.value === t.id,
  })),
);

const allTheaters = computed<Theater[]>(() =>
  (data.value?.theaters || []).map((t) => ({
    ...t,
    isHome: homeId.value === t.id,
  })),
);

const totalPages = computed(() => data.value?.totalPages ?? 1);
const showPagination = computed(() => totalPages.value > 1);

const membershipBusyIds = ref<Set<string>>(new Set());
const homeBusyIds = ref<Set<string>>(new Set());
const showHomeModal = ref(false);
const pendingHomeTheater = ref<TheaterLike | null>(null);
const showLeaveHomeModal = ref(false);
const pendingLeaveTheater = ref<TheaterLike | null>(null);
const settingHome = ref(false);
const leavingHome = ref(false);

const openHomePrompt = (theater: TheaterLike) => {
  pendingHomeTheater.value = theater;
  showHomeModal.value = true;
};

const openLeaveHomePrompt = (theater: TheaterLike) => {
  pendingLeaveTheater.value = theater;
  showLeaveHomeModal.value = true;
};

const handleToggle = async (action: "join" | "leave", theater: TheaterLike) => {
  if (!theater?.id) return;
  if (action === "leave" && homeId.value === theater.id) {
    openLeaveHomePrompt(theater);
    return;
  }

  const next = new Set(membershipBusyIds.value);
  next.add(theater.id);
  membershipBusyIds.value = next;

  try {
    await toggleMembership(theater as { slug: string; id?: string }, action);
    await refresh();
    if (action === "join" && !hasHome.value) openHomePrompt(theater);
  } finally {
    const after = new Set(membershipBusyIds.value);
    after.delete(theater.id);
    membershipBusyIds.value = after;
  }
};

const handleHome = async (action: "set" | "clear", theater: TheaterLike) => {
  if (!theater?.id) return;

  const homeBusy = new Set(homeBusyIds.value);
  homeBusy.add(theater.id);
  homeBusyIds.value = homeBusy;

  const needsJoin = action === "set" && !theater.isMember;
  if (needsJoin) {
    const memberBusy = new Set(membershipBusyIds.value);
    memberBusy.add(theater.id);
    membershipBusyIds.value = memberBusy;
  }

  try {
    if (action === "set") {
      if (needsJoin) {
        await toggleMembership(
          theater as { slug: string; id?: string },
          "join",
        );
      }
      await saveHome(theater.id);
    } else if (homeId.value === theater.id) {
      await saveHome(null);
    }
  } finally {
    const afterHome = new Set(homeBusyIds.value);
    afterHome.delete(theater.id);
    homeBusyIds.value = afterHome;

    if (needsJoin) {
      const afterMember = new Set(membershipBusyIds.value);
      afterMember.delete(theater.id);
      membershipBusyIds.value = afterMember;
    }
  }
};

const confirmHomeChoice = async (makeHome: boolean) => {
  if (!pendingHomeTheater.value) {
    showHomeModal.value = false;
    return;
  }

  settingHome.value = true;
  try {
    if (makeHome) {
      await saveHome(pendingHomeTheater.value.id || null);
    }
  } finally {
    settingHome.value = false;
    showHomeModal.value = false;
    pendingHomeTheater.value = null;
  }
};

const confirmLeaveHome = async () => {
  if (!pendingLeaveTheater.value?.id) {
    showLeaveHomeModal.value = false;
    return;
  }

  leavingHome.value = true;
  try {
    const theater = pendingLeaveTheater.value;
    await toggleMembership(theater as { slug: string; id?: string }, "leave");
    await saveHome(null);
  } finally {
    leavingHome.value = false;
    showLeaveHomeModal.value = false;
    pendingLeaveTheater.value = null;
  }
};

const cancelLeaveHome = () => {
  showLeaveHomeModal.value = false;
  pendingLeaveTheater.value = null;
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
        :pending="isLoading"
        empty-message="You're not a member yet. Follow or create a theater to see it here."
        primary-label="Open"
        :show-follow="true"
        :loading-ids="membershipBusyIds"
        :home-loading-ids="homeBusyIds"
        @toggle="(action, theater) => handleToggle(action, theater)"
        @home="(action, theater) => handleHome(action, theater)"
      />

      <TheaterList
        title="All theaters"
        :theaters="allTheaters"
        :pending="isLoading"
        primary-label="View"
        :show-follow="true"
        :loading-ids="membershipBusyIds"
        :home-loading-ids="homeBusyIds"
        @toggle="(action, theater) => handleToggle(action, theater)"
        @home="(action, theater) => handleHome(action, theater)"
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
              :disabled="isLoading"
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
