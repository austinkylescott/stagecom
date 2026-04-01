<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const supabase = useSupabaseClient();
const toast = useToast();
const loggingOut = ref(false);

const { displayName, avatarUrl, initials, isAuthed } = useUserIdentity();

const signOut = async () => {
  loggingOut.value = true;

  const { error } = await supabase.auth.signOut();

  if (error) {
    toast.add({
      title: "Sign-out failed",
      description: error.message,
      color: "red",
    });
  } else {
    toast.add({
      title: "Signed out",
      description: "See you next time.",
    });
  }

  loggingOut.value = false;
};

const authedItems = computed<DropdownMenuItem[][]>(() => [[
  {
    label: "Profile",
    to: "/profile",
    icon: "i-heroicons-user-circle",
    description: "Manage how you appear across the scene.",
  },
  {
    label: loggingOut.value ? "Logging out..." : "Logout",
    icon: "i-heroicons-arrow-left-on-rectangle",
    description: "End your current Stagecom session.",
    disabled: loggingOut.value,
    onSelect: signOut,
  },
]]);

const guestItems = [[
  {
    label: "Log in",
    to: "/login",
    icon: "i-heroicons-arrow-right-on-rectangle",
    description: "Open your existing account.",
  },
  {
    label: "Sign up",
    to: "/signup",
    icon: "i-heroicons-user-plus",
    description: "Create a new Stagecom account.",
  },
]] satisfies DropdownMenuItem[][];
</script>

<template>
  <AppHeaderDropdown
    :items="isAuthed ? authedItems : guestItems"
    header-tone-class="bg-(--stage-performer-soft)"
  >
    <template #default="{ open }">
      <StageButton
        variant="ghost"
        tone="performer"
        :active="open"
        class="flex items-center gap-2"
        :loading="loggingOut"
      >
        <UAvatar
          :src="avatarUrl"
          :text="initials"
          size="xs"
          class="border border-(--stage-ink) bg-(--stage-paper-strong) text-(--stage-ink)"
        />
        <span class="text-sm">{{ isAuthed ? displayName : "Account" }}</span>
        <UIcon name="i-heroicons-chevron-down" class="size-4" />
      </StageButton>
    </template>

    <template #header>
      <div class="flex min-w-0 items-center gap-3">
        <UAvatar
          :src="avatarUrl"
          :text="initials"
          size="sm"
          class="border border-(--stage-ink) bg-(--stage-paper) text-(--stage-ink)"
        />
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-(--stage-ink)">
            {{ isAuthed ? displayName : "Account" }}
          </p>
          <p class="text-xs text-(--stage-ink)/75">
            {{ isAuthed ? "Signed in" : "Guest options" }}
          </p>
        </div>
      </div>
    </template>
  </AppHeaderDropdown>
</template>
