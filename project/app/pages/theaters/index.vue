<script setup lang="ts">
import MultiHomeTheaterHub from "~/components/theater/hub/MultiHomeTheaterHub.vue";
import { useHomeTheater } from "~/composables/useHomeTheater";
import { useHomeTheaterMutation } from "~/composables/useHomeTheaterMutation";

const { data, error, isLoading } = useHomeTheater();
const { saveHome } = useHomeTheaterMutation();

const homeTheaters = computed(() => data.value?.homeTheaters || []);
const candidateTheaters = computed(() => data.value?.candidateTheaters || []);

const addHome = async (theaterId: string) => {
  await saveHome(theaterId, true);
};

const removeHome = async (theaterId: string) => {
  await saveHome(theaterId, false);
};
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)"
      inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div class="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-end">
        <div class="space-y-4">
          <span class="stage-kicker">Theater hub</span>
          <div>
            <h1 class="stage-section-title">Operate across your home theaters.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              This route is now the personalized theater hub. Keep multiple active theaters in rotation here, then step into a full theater board or browse flow only when you need a more specific context.
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

    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.5)]"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div
        v-if="isLoading && !homeTheaters.length && !candidateTheaters.length"
        class="stage-panel px-5 py-6 text-sm stage-muted"
      >
        Loading theater hub…
      </div>

      <div v-else class="space-y-6">
        <MultiHomeTheaterHub
          :candidate-theaters="candidateTheaters"
          :home-theaters="homeTheaters"
          @add-home="addHome"
          @remove-home="removeHome"
        />

        <div v-if="error" class="stage-panel px-5 py-4 text-sm text-red-700">
          {{ error?.data?.message || error?.message }}
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton variant="ghost" icon="i-heroicons-magnifying-glass" to="/theaters/browse">
            Browse all theaters
          </UButton>
          <UButton variant="ghost" icon="i-heroicons-calendar-days" to="/shows">
            Open schedule
          </UButton>
        </div>
      </div>
    </StageSection>
  </div>
</template>
