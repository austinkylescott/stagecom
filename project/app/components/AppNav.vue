<script setup lang="ts">
const navItems = [
  { label: "Home", to: "/" },
  { label: "Theaters", to: "/theaters" },
  { label: "Shows", to: "/shows" },
  { label: "Performers", to: "/performers" },
  { label: "Profile", to: "/profile" },
];
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
