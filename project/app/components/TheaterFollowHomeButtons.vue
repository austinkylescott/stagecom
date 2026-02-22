<script setup lang="ts">
import { useMembershipToggle } from "~/composables/useMembershipToggle";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";

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

const { toggleMembership } = useMembershipToggle();
const { saveHome, homeId } = useHomeTheaterState();

const localMember = ref(props.isMember);
const localHome = ref(props.isHome);
const loading = ref(false);

watch(
  () => props.isMember,
  (val) => (localMember.value = val),
);
watch(
  () => props.isHome,
  (val) => (localHome.value = val),
);

const computedIsHome = computed(
  () => localHome.value || homeId.value === props.theater.id,
);

const followLabel = computed(() => (localMember.value ? "Unfollow" : "Follow"));
const homeLabel = computed(() =>
  computedIsHome.value ? "Home theater" : "Set home",
);

const emitUpdate = () =>
  emit("updated", {
    theaterId: props.theater.id,
    isMember: localMember.value,
    isHome: computedIsHome.value,
  });

const handleFollow = async () => {
  loading.value = true;
  try {
    await toggleMembership(props.theater, localMember.value ? "leave" : "join");
    localMember.value = !localMember.value;
    // Clear home if user unfollows the current home theater.
    if (!localMember.value && computedIsHome.value) {
      await saveHome(null);
      localHome.value = false;
    }
    emitUpdate();
  } finally {
    loading.value = false;
  }
};

const handleHome = async () => {
  loading.value = true;
  try {
    if (computedIsHome.value) {
      await saveHome(null);
      localHome.value = false;
    } else {
      if (!localMember.value) {
        await toggleMembership(props.theater, "join");
        localMember.value = true;
      }
      await saveHome(props.theater.id);
      localHome.value = true;
    }
    emitUpdate();
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex gap-2 flex-wrap">
    <UButton
      :size="size"
      color="primary"
      :loading="loading"
      @click="handleFollow"
    >
      {{ followLabel }}
    </UButton>
    <UButton
      :size="size"
      variant="ghost"
      :color="computedIsHome ? 'primary' : 'gray'"
      icon="i-heroicons-home"
      :loading="loading"
      @click="handleHome"
    >
      {{ homeLabel }}
    </UButton>
  </div>
</template>
