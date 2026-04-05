<script setup lang="ts">
import type { TheaterEventPerson } from "~/queries/theaters";

const props = withDefaults(
  defineProps<{
    label: string;
    people: TheaterEventPerson[];
    emptyText: string;
    overflowAfter?: number;
  }>(),
  {
    overflowAfter: 1,
  },
);

const supportsHover = useMediaQuery("(hover: hover)");

const popoverMode = computed(() =>
  supportsHover.value ? "hover" : "click",
);

const displayPeople = computed(() =>
  props.people.map((person) => ({
    key: person.userId,
    name: person.displayName ?? person.userId,
  })),
);

const displayNames = computed(() => displayPeople.value.map((person) => person.name));

const visibleNames = computed(() => displayPeople.value.slice(0, props.overflowAfter));

const overflowCount = computed(() =>
  Math.max(displayNames.value.length - props.overflowAfter, 0),
);

const hasOverflow = computed(() => overflowCount.value > 0);
</script>

<template>
  <p>
    <span class="font-semibold text-(--stage-ink)">{{ label }}:</span>
    <span class="ml-1">
      <template v-if="displayNames.length">
        <span>{{ visibleNames.map((person) => person.name).join(", ") }}</span>
        <UPopover v-if="hasOverflow" :mode="popoverMode">
          <button
            type="button"
            class="ml-1 underline decoration-dotted underline-offset-2 hover:text-(--stage-ink)"
          >
            +{{ overflowCount }}
          </button>

          <template #content>
            <div class="max-w-xs space-y-2 p-3">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-stage-ink/70">
                {{ label }}
              </p>
              <ul class="space-y-1 text-sm leading-6 text-stage-ink/85">
                <li
                  v-for="person in displayPeople"
                  :key="person.key"
                >
                  {{ person.name }}
                </li>
              </ul>
            </div>
          </template>
        </UPopover>
      </template>
      <span v-else>{{ emptyText }}</span>
    </span>
  </p>
</template>
