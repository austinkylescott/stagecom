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
          <p class="font-semibold">Make this your home theater?</p>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-slate-700">
            {{ theaterName || "This theater" }} will show in your dashboard as
            the default place for schedules and invites.
          </p>
          <p class="text-sm text-slate-600">
            You can change your home theater anytime from this page.
          </p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              :disabled="loading"
              @click="emit('cancel')"
            >
              Not now
            </UButton>
            <UButton color="primary" :loading="loading" @click="emit('confirm')">
              Yes, make it home
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
