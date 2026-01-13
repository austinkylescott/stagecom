<script setup lang="ts">
const navItems = [
  { label: "Home", to: "/" },
  { label: "New Theater", to: "/theaters/new" },
];
</script>

<template>
  <UApp>
    <div class="min-h-screen">
      <UHeader title="Stagecom" to="/">
        <UContainer class="flex items-center justify-between py-3">
          <div class="flex items-center gap-4">
            <UNavigationMenu :items="navItems" class="hidden sm:flex" />
          </div>

          <div class="flex items-center gap-2">
            <div class="w-24" />
          </div>
        </UContainer>
      </UHeader>

      <UContainer class="py-8">
        <slot />
      </UContainer>
    </div>
  </UApp>
</template>
