<script setup lang="ts">
const props = defineProps<{
  page: number;
  totalPages?: number;
  disabledPrev?: boolean;
  disabledNext?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:page", value: number): void;
}>();

const prev = () => emit("update:page", Math.max(1, props.page - 1));
const next = () => emit("update:page", props.page + 1);
</script>

<template>
  <div class="flex items-center justify-between pt-2">
    <UButton
      size="xs"
      variant="ghost"
      icon="i-heroicons-arrow-left"
      :disabled="disabledPrev || page <= 1"
      @click="prev"
    >
      Prev
    </UButton>
    <p class="text-xs text-slate-600">
      Page {{ page }}<span v-if="totalPages"> / {{ totalPages }}</span>
    </p>
    <UButton
      size="xs"
      variant="ghost"
      icon="i-heroicons-arrow-right"
      trailing
      :disabled="disabledNext || (totalPages ? page >= totalPages : false)"
      @click="next"
    >
      Next
    </UButton>
  </div>
</template>
