<script setup lang="ts">
import type { TheaterAlert } from "~/utils/theaterPresentation";

const props = defineProps<{
  theaterAlerts: TheaterAlert[];
}>();

const activeTheaterAlertIndex = ref(0);
const alertTransitionDirection = ref<"forward" | "backward">("forward");
let theaterAlertsAutoplay: ReturnType<typeof setInterval> | null = null;

const activeTheaterAlert = computed(
  () => props.theaterAlerts[activeTheaterAlertIndex.value] ?? null,
);

const setActiveTheaterAlertIndex = (index: number) => {
  const total = props.theaterAlerts.length;
  if (!total) {
    activeTheaterAlertIndex.value = 0;
    return;
  }

  activeTheaterAlertIndex.value = ((index % total) + total) % total;
};

const scrollTheaterAlerts = (direction: "prev" | "next") => {
  alertTransitionDirection.value =
    direction === "prev" ? "backward" : "forward";

  setActiveTheaterAlertIndex(
    activeTheaterAlertIndex.value + (direction === "prev" ? -1 : 1),
  );
};

const handleTheaterAlertSelect = (index: number) => {
  alertTransitionDirection.value =
    index < activeTheaterAlertIndex.value ? "backward" : "forward";
  setActiveTheaterAlertIndex(index);
};

watch(
  () => props.theaterAlerts.length,
  (length) => {
    if (!length) {
      activeTheaterAlertIndex.value = 0;
      return;
    }

    if (activeTheaterAlertIndex.value >= length) {
      setActiveTheaterAlertIndex(0);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.theaterAlerts.length <= 1) return;

  theaterAlertsAutoplay = setInterval(() => {
    alertTransitionDirection.value = "forward";
    scrollTheaterAlerts("next");
  }, 10000);
});

onBeforeUnmount(() => {
  if (theaterAlertsAutoplay) {
    clearInterval(theaterAlertsAutoplay);
  }
});
</script>

<template>
  <article
    class="flex min-h-56 flex-col border-2 border-(--stage-ink) bg-stage-surface-theater px-4 py-4 sm:px-5"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p class="stage-overline text-stage-ink/60">
          Theater Alerts
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <StageButton
          size="xs"
          variant="ghost"
          tone="neutral"
          icon="i-heroicons-arrow-left"
          @click="scrollTheaterAlerts('prev')"
        />
        <StageButton
          size="xs"
          variant="ghost"
          tone="neutral"
          icon="i-heroicons-arrow-right"
          @click="scrollTheaterAlerts('next')"
        />
      </div>
    </div>

    <Transition
      mode="out-in"
      enter-active-class="transition duration-200 ease-out"
      :enter-from-class="
        alertTransitionDirection === 'forward'
          ? 'translate-x-4 opacity-0'
          : '-translate-x-4 opacity-0'
      "
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      :leave-to-class="
        alertTransitionDirection === 'forward'
          ? '-translate-x-4 opacity-0'
          : 'translate-x-4 opacity-0'
      "
    >
      <div
        v-if="activeTheaterAlert"
        :key="activeTheaterAlert.id"
        class="flex min-h-0 flex-1 flex-col"
      >
        <h2
          class="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-(--stage-ink)"
        >
          {{ activeTheaterAlert.title }}
        </h2>

          <p class="mt-4 text-sm leading-7 text-stage-ink/80">
          {{ activeTheaterAlert.description }}
        </p>

        <div
            class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t-2 border-stage-ink/15 pt-3"
        >
          <div class="flex items-center gap-2">
            <button
              v-for="(alert, index) in theaterAlerts"
              :key="alert.id"
              type="button"
              class="size-2.5 border border-(--stage-ink) transition-colors"
              :class="
                index === activeTheaterAlertIndex
                  ? 'bg-(--stage-ink)'
                  : 'bg-transparent hover:bg-(--stage-paper)'
              "
              :aria-label="`Open alert ${index + 1}`"
              @click="handleTheaterAlertSelect(index)"
            />
          </div>

          <div
              class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-stage-ink/60"
          >
            <span>{{ activeTheaterAlert.posted }}</span>
            <span>{{ activeTheaterAlert.expires }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </article>
</template>
