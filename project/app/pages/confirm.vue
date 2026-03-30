<script setup lang="ts">
const user = useSupabaseUser();
const route = useRoute();
const redirectTarget = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/")
    ? redirect
    : "/";
});
const isRedirecting = ref(false);

watch(
  user,
  () => {
    if (!user.value || isRedirecting.value) return;
    isRedirecting.value = true;
    setTimeout(() => {
      navigateTo(redirectTarget.value);
    }, 1200);
  },
  { immediate: true },
);
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-8">
    <section class="stage-panel stage-texture overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
      <span class="stage-kicker">Email confirmation</span>
      <h1 class="mt-4 stage-section-title">Confirming your account.</h1>
    </section>

    <UAlert v-if="user" color="success" variant="soft">
      <template #title>Confirmed</template>
      <template #description> You're signed in. Redirecting now... </template>
    </UAlert>

    <UAlert v-else color="info" variant="soft">
      <template #title>Checking confirmation</template>
      <template #description>
        If you clicked the email link, this page will continue automatically. If
        not, please sign in.
      </template>
    </UAlert>

    <div v-if="!user" class="flex gap-2">
      <UButton to="/login" color="primary">Go to login</UButton>
      <UButton to="/signup" variant="soft">Create account</UButton>
    </div>
  </div>
</template>
