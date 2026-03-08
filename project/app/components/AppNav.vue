<script setup lang="ts">
const { isAuthed } = useUserIdentity();
const navItems = computed(() => {
  const items = [
    { label: "Home", to: "/" },
    { label: "Theaters", to: "/theaters" },
    { label: "Performers", to: "/performers" },
  ];

  if (isAuthed.value) {
    items.push(
      { label: "Shows", to: "/shows" },
      { label: "Review", to: "/review" },
      { label: "Profile", to: "/profile" },
    );
  }

  return items;
});
</script>

<template>
  <UHeader mode="drawer">
    <template #title>
      <div>Stagecom</div>
    </template>

    <template #body>
      <UNavigationMenu orientation="vertical" :items="navItems" />
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <div class="flex items-center gap-2">
        <AppAccountMenu />
      </div>
    </template>
  </UHeader>
</template>
