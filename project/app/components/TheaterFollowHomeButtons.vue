<script setup lang="ts">
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useTheaterRelationship } from "~/composables/useTheaterRelationship";

type Theater = { id: string; slug: string; name?: string };

const props = withDefaults(
  defineProps<{
    theater: Theater;
    isMember?: boolean;
    isHome?: boolean;
    size?: "xs" | "sm" | "md";
  }>(),
  {
    isMember: false,
    isHome: false,
    size: "sm",
  },
);

const emit = defineEmits<{
  (
    e: "updated",
    payload: { theaterId: string; isMember: boolean; isHome: boolean },
  ): void;
}>();

const { homeIds } = useHomeTheaterState();

const localMember = ref(props.isMember);
const localHome = ref(props.isHome);

watch(
  () => props.isMember,
  (val) => (localMember.value = val),
);
watch(
  () => props.isHome,
  (val) => (localHome.value = val),
);

const computedIsHome = computed(
  () => localHome.value || homeIds.value.includes(props.theater.id),
);

const theaterTarget = computed(() => props.theater);

const {
  followLabel,
  handleFollowToggle,
  handleHomeToggle,
  relationshipLoading,
} = useTheaterRelationship({
  theater: theaterTarget,
  isMember: localMember,
  isHome: computedIsHome,
});

const emitUpdate = () =>
  emit("updated", {
    theaterId: props.theater.id,
    isMember: localMember.value,
    isHome: computedIsHome.value,
  });

const handleFollow = async () => {
  const wasMember = localMember.value;
  const wasHome = computedIsHome.value;
  await handleFollowToggle();
  localMember.value = !wasMember;
  if (wasMember && wasHome) {
    localHome.value = false;
  }
  emitUpdate();
};

const handleHome = async () => {
  const wasHome = computedIsHome.value;
  await handleHomeToggle();

  if (wasHome) {
    localHome.value = false;
  } else {
    localHome.value = true;
  }

  emitUpdate();
};
</script>

<template>
  <div class="flex gap-2 flex-wrap">
    <UButton
      :size="size"
      color="primary"
      :loading="relationshipLoading"
      @click="handleFollow"
    >
      {{ followLabel }}
    </UButton>
    <UButton
      :size="size"
      variant="ghost"
      :color="computedIsHome ? 'primary' : 'neutral'"
      icon="i-heroicons-home"
      :disabled="!localMember && !computedIsHome"
      :loading="relationshipLoading"
      @click="handleHome"
    >
      {{ computedIsHome ? "Home theater" : "Set home" }}
    </UButton>
  </div>
</template>
