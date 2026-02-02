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

const authedItems: DropdownMenuItem[] = [
  { label: "Profile", to: "/profile", icon: "i-heroicons-user-circle" },
  {
    label: "Logout",
    icon: "i-heroicons-arrow-left-on-rectangle",
    onSelect: signOut,
  },
];

const guestItems: DropdownMenuItem[] = [
  {
    label: "Log in",
    to: "/login",
    icon: "i-heroicons-arrow-right-on-rectangle",
  },
  { label: "Sign up", to: "/signup", icon: "i-heroicons-user-plus" },
];
</script>

<template>
  <UDropdownMenu
    :items="isAuthed ? authedItems : guestItems"
    :content="{ align: 'end', sideOffset: 8 }"
  >
    <UButton
      color="gray"
      variant="ghost"
      class="flex items-center gap-2"
      :loading="loggingOut"
    >
      <UAvatar
        :src="avatarUrl"
        :text="initials"
        size="xs"
        class="bg-slate-200 text-slate-700"
      />
      <span class="text-sm">{{ isAuthed ? displayName : "Account" }}</span>
      <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
    </UButton>
  </UDropdownMenu>
</template>
