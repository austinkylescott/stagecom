<script setup lang="ts">
type Producer = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

defineProps<{
  producers: Producer[];
}>();
</script>

<template>
  <div v-if="producers.length" class="space-y-2">
    <p class="text-sm font-semibold text-(--stage-ink)">
      Producer{{ producers.length > 1 ? "s" : "" }}
    </p>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="producer in producers"
        :key="producer.userId"
        class="inline-flex items-center gap-2 border-2 border-(--stage-ink) bg-(--stage-paper) px-3 py-1.5"
      >
        <UAvatar :text="producer.displayName?.[0] ?? '?'" size="xs" />
        <span class="text-sm font-medium text-(--stage-ink)">
          {{ producer.displayName ?? producer.userId }}
        </span>
        <UBadge size="xs" color="error" variant="soft">producer</UBadge>
      </div>
    </div>
  </div>
</template>
