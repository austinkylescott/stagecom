<script setup lang="ts">
import { type StageButtonTone, stageButtonToneClasses } from "~/utils/stageButtonTone";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  tone?: StageButtonTone;
  active?: boolean;
}>(), {
  tone: "neutral",
  active: false,
});

const attrs = useAttrs();
</script>

<template>
  <UButton
    v-bind="attrs"
    :class="stageButtonToneClasses(props.tone, props.active)"
  >
    <slot />
  </UButton>
</template>
