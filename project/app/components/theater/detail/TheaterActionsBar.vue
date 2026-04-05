<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { TheaterDetails } from "~/queries/theaters";

const props = defineProps<{
  theater: TheaterDetails["theater"] | null;
  slug: string;
  canReview: boolean;
  isMember: boolean;
  relationshipLoading: boolean;
  theaterActionsMenuItems: DropdownMenuItem[][];
}>();

const calendarPath = computed(() => `/theaters/${props.slug}/calendar`);
const createEventPath = computed(() => `/theaters/${props.slug}/shows/new`);
const adminPath = computed(() => `/theaters/${props.slug}/admin`);
</script>

<template>
  <div class="flex w-full min-w-0 flex-wrap items-center gap-2">
    <StageButton
      variant="ghost"
      tone="event"
      :to="calendarPath"
      icon="i-heroicons-calendar-days"
      class="w-full sm:w-auto"
    >
      Full calendar
    </StageButton>
    <StageButton
      v-if="isMember"
      variant="ghost"
      tone="event"
      :to="createEventPath"
      icon="i-heroicons-plus"
      class="hidden md:inline-flex"
    >
      Create an event
    </StageButton>
    <StageButton
      v-if="canReview"
      variant="ghost"
      tone="theater"
      :to="adminPath"
      icon="i-heroicons-shield-check"
      class="hidden lg:inline-flex"
    >
      Theater admin
    </StageButton>
    <StageDropdown
      v-if="theater"
      class="w-full sm:ml-auto sm:w-auto"
      :items="theaterActionsMenuItems"
      :content="{ align: 'end', sideOffset: 8 }"
      width-class="w-64"
    >
      <template #default>
        <StageButton
          size="sm"
          variant="ghost"
          tone="neutral"
          icon="i-heroicons-ellipsis-horizontal"
          class="w-full sm:w-auto"
          :loading="relationshipLoading"
        >
          Theater actions
        </StageButton>
      </template>
    </StageDropdown>
  </div>
</template>
