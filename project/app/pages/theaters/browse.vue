<script setup lang="ts">
import { useRequestHeaders } from "#app";
import TheaterList from "~/components/TheaterList.vue";
import HomeTheaterPrompt from "~/components/HomeTheaterPrompt.vue";
import HomeTheaterLeavePrompt from "~/components/HomeTheaterLeavePrompt.vue";
import { useMembershipToggle } from "~/composables/useMembershipToggle";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useHomeTheaterMutation } from "~/composables/useHomeTheaterMutation";
import { useSearchQuery } from "~/composables/useSearchQuery";
import { useTheaterSearch } from "~/composables/useTheaterSearch";
import type { Theater, TheatersResponse } from "~/queries/theaters";

type TheaterLike = {
  id?: string;
  slug?: string;
  name?: string;
  isMember?: boolean;
};

const { hasHome, homeIds, homeTheaters } = useHomeTheaterState();
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
    isHome: homeIds.value.includes(t.id),
  })),
);

const allTheaters = computed<Theater[]>(() =>
  (data.value?.theaters || []).map((t) => ({
    ...t,
    isHome: homeIds.value.includes(t.id),
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
  if (action === "leave" && homeIds.value.includes(theater.id)) {
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

  try {
    if (action === "set") {
      await saveHome(theater.id, true);
    } else if (homeIds.value.includes(theater.id)) {
      await saveHome(theater.id, false);
    }
  } finally {
    const afterHome = new Set(homeBusyIds.value);
    afterHome.delete(theater.id);
    homeBusyIds.value = afterHome;
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
      await saveHome(pendingHomeTheater.value.id || null, true);
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
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-end">
        <div class="space-y-4">
          <span class="stage-kicker">Theater discovery</span>
          <div>
            <h1 class="stage-section-title">Browse and manage theater membership.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              Use discovery intentionally here. Search all theaters, follow or leave communities, and choose when to change your home base without turning the main theater hub into a permanent directory.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 lg:justify-self-end">
          <UButton variant="ghost" icon="i-heroicons-building-library" to="/theaters">
            Back to theater hub
          </UButton>
          <UButton color="primary" icon="i-heroicons-plus" to="/theaters/new">
            Create theater
          </UButton>
        </div>
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.5)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="stage-stat">
          <span class="stage-overline">Home theaters</span>
          <span class="stage-stat-value">{{ homeTheaters.length }}</span>
          <p class="mt-2 text-sm stage-muted">
            {{ hasHome ? "Discovery is secondary because your main theater context already lives in the hub." : "Pin one or more member theaters when you are ready to turn the hub into your steady-state board." }}
          </p>
        </div>
        <div class="stage-stat">
          <span class="stage-overline">Following</span>
          <span class="stage-stat-value">{{ myTheaters.length }}</span>
          <p class="mt-2 text-sm stage-muted">Communities you already belong to or track.</p>
        </div>
        <div class="stage-stat">
          <span class="stage-overline">Browse results</span>
          <span class="stage-stat-value">{{ allTheaters.length }}</span>
          <p class="mt-2 text-sm stage-muted">Results for the current search and sort state.</p>
        </div>
      </div>

      <div v-if="error" class="mb-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <TheaterList
          title="Following"
          :theaters="myTheaters"
          :pending="isLoading"
          empty-message="You're not following any theaters yet."
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
                <div>
                  <p class="stage-overline">All theaters</p>
                  <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                    Browse the board
                  </h2>
                  <p class="mt-2 max-w-xl text-sm leading-7 stage-muted">
                    Search the broader network only when you need it. The main theater route should stay centered on your actual operating context.
                  </p>
                </div>
                <div class="flex gap-2 flex-wrap">
                  <UInput
                    v-model="search"
                    icon="i-heroicons-magnifying-glass"
                    placeholder="Search theaters"
                    class="w-full sm:w-64"
                  />
                  <USelect
                    v-model="sort"
                    :items="[
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
    </StageSection>

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
