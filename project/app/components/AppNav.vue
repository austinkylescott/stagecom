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
  <div class="flex items-center justify-between py-3">
    <div class="flex items-center gap-4">
      <UNavigationMenu :items="navItems" class="hidden sm:flex" />
    </div>

    <div class="flex items-center gap-2">
      <AccountMenu />
    </div>
  </div>
</template>
