<script setup lang="ts">
import TheaterList from "~/components/TheaterList.vue";
import Pager from "~/components/Pager.vue";
import { useTheaterSearch } from "~/composables/useTheaterSearch";
import { useMembershipToggle } from "~/composables/useMembershipToggle";
import HomeTheaterHero from "~/components/HomeTheaterHero.vue";
import { useHomeTheater } from "~/composables/useHomeTheater";

const search = ref("");
const sort = ref<"name_asc" | "recent" | "next_show">("name_asc");
const page = ref(1);

const { data, pending, error, refresh } = useTheaterSearch({
  search,
  sort,
  page,
});
const { data: homeData, refresh: refreshHome } = useHomeTheater();
const homeTheater = computed(() => homeData.value?.theater || null);
const homeShows = computed(() => homeData.value?.shows || []);
const homeCandidates = computed(() => homeData.value?.candidates || []);
const homeId = computed(() => homeTheater.value?.id || null);
const hasHome = computed(() => Boolean(homeId.value));

const { toggleMembership } = useMembershipToggle();

const membershipBusyIds = ref<Set<string>>(new Set());
const homeBusyIds = ref<Set<string>>(new Set());
const showHomeModal = ref(false);
const pendingHomeTheater = ref<any | null>(null);
const settingHome = ref(false);

const patchMembership = (theater: any, isMember: boolean) => {
  if (!theater?.id || !data.value) return;

  // Update "all theaters" list membership flag
  const updatedAll =
    data.value.theaters?.map((t: any) =>
      t.id === theater.id ? { ...t, isMember } : t,
    ) ?? [];

  // Update "my theaters" list contents
  let updatedMine = data.value.myTheaters ?? [];
  if (isMember) {
    const alreadyThere = updatedMine.some((t: any) => t.id === theater.id);
    if (!alreadyThere) {
      updatedMine = [{ ...theater, isMember: true }, ...updatedMine];
    } else {
      updatedMine = updatedMine.map((t: any) =>
        t.id === theater.id ? { ...t, isMember: true } : t,
      );
    }
  } else {
    updatedMine = updatedMine.filter((t: any) => t.id !== theater.id);
  }

  data.value = {
    ...data.value,
    theaters: updatedAll,
    myTheaters: updatedMine,
  };
};

const setHome = async (theaterId: string | null) => {
  await $fetch("/api/me/home-theater", {
    method: "POST",
    credentials: "include",
    body: { theaterId },
  });
  await Promise.all([refreshHome(), refresh()]);
};

const refreshListsAndHome = async () => {
  await Promise.all([refresh(), refreshHome()]);
};

const openHomePrompt = (theater: any) => {
  pendingHomeTheater.value = theater;
  showHomeModal.value = true;
};

const handleToggle = async (action: "join" | "leave", theater: any) => {
  if (!theater?.id) return;
  const next = new Set(membershipBusyIds.value);
  next.add(theater.id);
  membershipBusyIds.value = next;

  try {
    await toggleMembership(theater, action);
    patchMembership(theater, action === "join");
    await refreshListsAndHome();
    if (action === "join" && !hasHome.value) {
      openHomePrompt(theater);
    }
  } finally {
    const after = new Set(membershipBusyIds.value);
    after.delete(theater.id);
    membershipBusyIds.value = after;
  }
};

const handleHome = async (action: "set" | "clear", theater: any) => {
  if (!theater?.id) return;

  const homeBusy = new Set(homeBusyIds.value);
  homeBusy.add(theater.id);
  homeBusyIds.value = homeBusy;

  const needsJoin = action === "set" && !theater.isMember;
  if (needsJoin) {
    const mb = new Set(membershipBusyIds.value);
    mb.add(theater.id);
    membershipBusyIds.value = mb;
  }

  try {
    if (action === "set") {
      if (needsJoin) {
        await toggleMembership(theater, "join");
        patchMembership(theater, true);
      }
      await setHome(theater.id);
    } else if (action === "clear" && homeId.value === theater.id) {
      await setHome(null);
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
      await setHome(pendingHomeTheater.value.id);
    }
  } finally {
    settingHome.value = false;
    showHomeModal.value = false;
    pendingHomeTheater.value = null;
  }
};

const myTheaters = computed(() =>
  (data.value?.myTheaters || []).map((t: any) => ({
    ...t,
    isMember: true,
    isHome: homeId.value === t.id,
  })),
);

const allTheaters = computed(() =>
  (data.value?.theaters || []).map((t: any) => ({
    ...t,
    isHome: homeId.value === t.id,
  })),
);
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
      :key="homeId || 'none'"
      :theater="homeTheater"
      :shows="homeShows"
      :candidates="homeCandidates"
      :on-set-home="setHome"
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
      </TheaterList>
    </div>

    <Pager
      :page="page"
      :total-pages="data?.totalPages"
      :disabled-prev="page <= 1"
      :disabled-next="data?.totalPages ? page >= data.totalPages : false"
      @update:page="(p) => (page = p)"
    />

    <UModal v-model="showHomeModal">
      <UCard>
        <template #header>
          <p class="font-semibold">Make this your home theater?</p>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-slate-700">
            {{ pendingHomeTheater?.name || "This theater" }} will show in your
            dashboard as the default place for schedules and invites.
          </p>
          <p class="text-sm text-slate-600">
            You can change your home theater anytime from this page.
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              :disabled="settingHome"
              @click="confirmHomeChoice(false)"
            >
              Not now
            </UButton>
            <UButton
              color="primary"
              :loading="settingHome"
              @click="confirmHomeChoice(true)"
            >
              Yes, make it home
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
