<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  theaterName?: string | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <UModal
    :open="props.modelValue"
    @update:open="(val) => emit('update:modelValue', val)"
  >
    <template #content>
      <UCard>
        <template #header>
          <p class="font-semibold">Leave your home theater?</p>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-(--stage-ink)">
            {{ theaterName || "This theater" }} is currently your home theater.
          </p>
          <p class="text-sm stage-muted">
            Leaving it will remove it as your home and you won't see its shows
            by default.
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" :disabled="loading" @click="emit('cancel')">
              Stay a member
            </UButton>
            <UButton color="error" :loading="loading" @click="emit('confirm')">
              Leave theater and remove home
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
