<script setup lang="ts">
const { isAuthed } = useUserIdentity();
</script>

<template>
  <AuthenticatedAppShell v-if="isAuthed">
    <slot />
  </AuthenticatedAppShell>

  <template v-else>
    <AppNav />
    <main>
      <slot />
    </main>
    <AppFooter />
  </template>
</template>
