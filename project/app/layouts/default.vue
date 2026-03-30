<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === "/");
</script>

<template>
  <UApp>
    <AppNav />
    <main
      :class="
        isHome
          ? 'pb-16'
          : 'mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8'
      "
    >
      <slot />
    </main>
  </UApp>
</template>
