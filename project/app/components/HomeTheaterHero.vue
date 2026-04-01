<script setup lang="ts">
import { useLocationFormatter } from "~/composables/useLocationFormatter";

const props = withDefaults(
  defineProps<{
    theater?: {
      id: string;
      name: string;
      slug: string;
      tagline?: string | null;
      city?: string | null;
      state_region?: string | null;
      country?: string | null;
    } | null;
    shows?: {
      id: string;
      title: string;
      startsAt: string | null;
      description?: string | null;
    }[];
    candidates?: {
      id: string;
      name: string;
      slug: string;
      tagline?: string | null;
      city?: string | null;
      state_region?: string | null;
      country?: string | null;
    }[];
    membership?: {
      status: string | null;
      roles: string[];
    };
    permissions?: {
      isMember: boolean;
      canCreateShow: boolean;
      canReview: boolean;
    };
    stats?: {
      pendingReviewCount: number;
      publicShowCount: number;
      upcomingPublicCount: number;
    };
    onSetHome?: (theaterId: string | null) => Promise<void> | void;
  }>(),
  {
    theater: null,
    shows: () => [],
    candidates: () => [],
    membership: () => ({ status: null, roles: [] }),
    permissions: () => ({
      isMember: false,
      canCreateShow: false,
      canReview: false,
    }),
    stats: () => ({
      pendingReviewCount: 0,
      publicShowCount: 0,
      upcomingPublicCount: 0,
    }),
  },
);

const { formatLocation } = useLocationFormatter();

const upcomingCount = computed(() => props.shows?.length || 0);
const candidateCount = computed(() => props.candidates?.length || 0);
const roleLabel = computed(() => {
  if (props.permissions?.canReview) return "Admin / staff";
  if (props.permissions?.isMember) return "Member";
  return "Visitor";
});
</script>

<template>
  <section class="space-y-6">
    <section
      v-if="theater && permissions?.canReview"
      class="stage-panel-accent p-5 sm:p-6"
    >
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="stage-overline">Action items</p>
          <h3 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            {{ stats?.pendingReviewCount ? `${stats.pendingReviewCount} shows need review` : "Review queue is clear" }}
          </h3>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-(--stage-ink-soft)">
            Oversight users should be able to tell immediately whether the theater needs action. This panel stays focused on operational review work instead of mixing it into discovery UI.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton to="/review" icon="i-heroicons-inbox-stack">
            Open approvals
          </UButton>
          <UButton
            v-if="theater"
            :to="`/theaters/${theater.slug}/shows/new`"
            variant="ghost"
            icon="i-heroicons-plus"
          >
            New show
          </UButton>
        </div>
      </div>
    </section>

    <div class="stage-panel p-6 sm:p-8">
      <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="space-y-2">
              <p class="stage-overline">Theater hub</p>
              <h2 class="stage-section-title">
                {{ theater?.name || "Choose a home theater" }}
              </h2>
              <p
                v-if="theater?.tagline"
                class="max-w-2xl text-base leading-7 stage-muted"
              >
                {{ theater.tagline }}
              </p>
              <p class="text-sm stage-muted">
                {{ theater ? formatLocation(theater) : "Set a home base so this page becomes your steady-state theater hub." }}
              </p>
            </div>

            <div class="flex gap-2 flex-wrap self-start">
              <UButton
                v-if="theater"
                size="sm"
                :to="`/theaters/${theater.slug}`"
                icon="i-heroicons-arrow-top-right-on-square"
              >
                Open theater
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                icon="i-heroicons-magnifying-glass"
                to="/theaters/browse"
              >
                Browse theaters
              </UButton>
              <UButton
                v-if="theater && onSetHome"
                size="sm"
                variant="ghost"
                color="neutral"
                icon="i-heroicons-x-mark"
                @click="onSetHome(null)"
              >
                Clear home
              </UButton>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stage-stat">
              <span class="stage-overline">Your role</span>
              <span class="stage-stat-value">{{ roleLabel }}</span>
              <p class="mt-2 text-sm stage-muted">
                {{ theater ? "The hub should prioritize what matters for your theater relationship." : "Pick a theater to turn this route into a real home base." }}
              </p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Upcoming</span>
              <span class="stage-stat-value">{{ stats?.upcomingPublicCount ?? upcomingCount }}</span>
              <p class="mt-2 text-sm stage-muted">
                {{ theater ? "Public upcoming events at your theater." : "Upcoming theater programming will show here once a home theater is set." }}
              </p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Public board</span>
              <span class="stage-stat-value">{{ theater ? stats?.publicShowCount : candidateCount }}</span>
              <p class="mt-2 text-sm stage-muted">
                {{ theater ? "Approved public programming visible from this theater hub." : "Browse or switch theaters intentionally instead of keeping discovery as the default view." }}
              </p>
            </div>
          </div>

          <div
            v-if="theater"
            class="flex flex-wrap gap-2"
          >
            <UButton
              v-if="permissions?.canReview"
              to="/review"
              icon="i-heroicons-inbox-stack"
            >
              Review queue
            </UButton>
            <UButton
              v-if="permissions?.canCreateShow"
              :to="`/theaters/${theater.slug}/shows/new`"
              variant="ghost"
              icon="i-heroicons-plus"
            >
              Create show
            </UButton>
            <UButton
              to="/shows"
              variant="ghost"
              icon="i-heroicons-calendar-days"
            >
              Open schedule
            </UButton>
          </div>
        </div>

        <section class="stage-list-card p-5 sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="stage-overline">Upcoming shows</p>
              <h3 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ theater ? "Open to the public" : "What this hub will show" }}
              </h3>
            </div>
            <NuxtLink
              v-if="theater"
              :to="`/theaters/${theater.slug}`"
              class="stage-link text-sm text-(--stage-ink)"
            >
              Open theater
            </NuxtLink>
          </div>

          <div class="mt-4 space-y-3">
            <NuxtLink
              v-for="show in shows"
              :key="show.id"
              :to="theater ? `/theaters/${theater.slug}/shows/${show.id}` : undefined"
              class="block border-2 border-(--stage-ink) bg-[rgba(251,247,239,0.72)] p-4 transition-colors hover:bg-(--stage-paper-strong)"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-(--stage-ink)">{{ show.title }}</p>
                  <p class="mt-1 text-xs uppercase tracking-[0.14em] stage-muted">
                    {{ show.startsAt ? new Date(show.startsAt).toLocaleString() : "TBD" }}
                  </p>
                </div>
                <span class="stage-chip bg-(--stage-event) text-(--stage-ink)">
                  Show
                </span>
              </div>
              <p
                v-if="show.description"
                class="mt-3 text-sm leading-6 stage-muted line-clamp-2"
              >
                {{ show.description }}
              </p>
            </NuxtLink>

            <div
              v-if="!shows?.length"
              class="border-2 border-dashed border-(--stage-ink) bg-[rgba(251,247,239,0.7)] px-4 py-6 text-sm stage-muted"
            >
              {{
                theater
                  ? "No upcoming shows are scheduled at your home theater yet."
                  : "Once you choose a home theater, its upcoming programming will live here."
              }}
            </div>
          </div>
        </section>
      </div>
    </div>

    <section
      v-if="!theater && candidates?.length"
      class="stage-panel p-6 sm:p-8"
    >
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p class="stage-overline">Set a home theater</p>
          <h3 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Pick your home base
          </h3>
          <p class="mt-3 max-w-3xl text-sm leading-7 stage-muted">
            Start with theaters you already know. Discovery stays available, but this route should settle into your steady-state theater workspace after setup.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton to="/theaters/browse" variant="ghost" icon="i-heroicons-magnifying-glass">
            Browse all theaters
          </UButton>
          <UButton to="/theaters/new" icon="i-heroicons-plus">
            Create theater
          </UButton>
        </div>
      </div>

      <div class="mt-5 grid gap-4 lg:grid-cols-3">
        <article
          v-for="c in candidates"
          :key="c.id"
          class="stage-list-card p-4"
        >
          <div>
            <p class="font-display text-3xl uppercase tracking-[0.08em]">
              {{ c.name }}
            </p>
            <p class="mt-1 text-xs uppercase tracking-[0.14em] stage-muted">
              {{ formatLocation(c) }}
            </p>
            <p
              v-if="c.tagline"
              class="mt-3 text-sm leading-6 stage-muted line-clamp-2"
            >
              {{ c.tagline }}
            </p>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <UButton
              size="xs"
              :to="`/theaters/${c.slug}`"
              variant="ghost"
            >
              Open
            </UButton>
            <UButton
              size="xs"
              icon="i-heroicons-home"
              :disabled="!onSetHome"
              @click="onSetHome?.(c.id)"
            >
              Make home
            </UButton>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
