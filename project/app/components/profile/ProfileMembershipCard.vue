<script setup lang="ts">
import { computed, toRef } from "vue";
import { useTheaterRelationship } from "~/composables/useTheaterRelationship";
import type { HomeTheaterMembershipSummary } from "~/queries/home";
import { toTheaterPath } from "~/utils/routes";

const props = defineProps<{
  membership: HomeTheaterMembershipSummary;
}>();

const membership = toRef(props, "membership");
const theater = computed(() => ({
  id: membership.value.theater.id,
  slug: membership.value.theater.slug,
  name: membership.value.theater.name,
}));
const isMember = computed(() => membership.value.membership.status === "active");
const isHome = computed(() => membership.value.membership.isHome);
const roleBadges = computed(() =>
  (membership.value.membership.roles || []).map((role) =>
    role.replace(/_/g, " "),
  ),
);

const { handleFollowToggle, handleHomeToggle, relationshipLoading } =
  useTheaterRelationship({
    theater,
    isMember,
    isHome,
  });
</script>

<template>
  <UCard
    :ui="{
      body: 'space-y-5',
    }"
  >
    <div class="space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="stage-kicker">Theater Membership</p>
          <h3 class="stage-section-title text-2xl">
            {{ membership.theater.name }}
          </h3>
          <p class="max-w-xl text-sm text-(--stage-ink-soft)">
            {{ membership.theater.tagline || "No theater tagline yet." }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge color="primary">
            {{ membership.membership.isHome ? "Home theater" : "Membership" }}
          </UBadge>
          <UBadge color="warning">
            {{ membership.membership.status || "unknown" }}
          </UBadge>
          <UBadge
            v-for="role in roleBadges"
            :key="role"
            color="neutral"
          >
            {{ role }}
          </UBadge>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 text-sm text-(--stage-ink-soft)">
        <span v-if="membership.theater.city">
          {{ membership.theater.city }}
        </span>
        <span v-if="membership.theater.state_region">
          {{ membership.theater.state_region }}
        </span>
        <span v-if="membership.theater.country">
          {{ membership.theater.country }}
        </span>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <UButton
        color="primary"
        :to="toTheaterPath(membership.theater.slug)"
      >
        Open theater
      </UButton>
      <UButton
        color="warning"
        variant="outline"
        :loading="relationshipLoading"
        @click="handleHomeToggle"
      >
        {{ membership.membership.isHome ? "Remove home" : "Make home" }}
      </UButton>
      <UButton
        color="error"
        variant="outline"
        :loading="relationshipLoading"
        @click="handleFollowToggle"
      >
        Leave theater
      </UButton>
    </div>
  </UCard>
</template>
