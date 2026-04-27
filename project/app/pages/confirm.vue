<script setup lang="ts">
const user = useSupabaseUser();
const route = useRoute();
const isRedirecting = ref(false);

const redirectTarget = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/callsheet";
});

watch(
  user,
  () => {
    if (!user.value || isRedirecting.value) return;
    isRedirecting.value = true;
    setTimeout(() => navigateTo(redirectTarget.value), 1200);
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-6 pt-16">
    <section class="w-full max-w-3xl stitch-border-heavy bg-(--stage-paper) stitch-shadow-lg">
      <div class="border-b-[4px] border-(--stage-ink) bg-(--stage-event) p-6">
        <p class="stitch-nav-label text-xs tracking-[0.22em]">Email Confirmation</p>
        <h1 class="stitch-display mt-3 text-5xl font-black">Confirming Your Account.</h1>
      </div>

      <div class="space-y-6 p-6 md:p-8">
        <div
          class="stitch-border p-5"
          :class="user ? 'bg-(--stage-theater-soft)' : 'bg-(--stage-paper)'"
        >
          <p class="text-lg font-bold">
            {{
              user
                ? "Confirmed. You're signed in. Redirecting now..."
                : "If you clicked the email link, this page will continue automatically. If not, please sign in."
            }}
          </p>
        </div>

        <div v-if="!user" class="flex flex-wrap gap-4">
          <NuxtLink
            to="/login"
            class="stitch-display border-[4px] border-(--stage-ink) bg-(--stage-theater) px-6 py-3 text-xl font-black shadow-[4px_4px_0_0_var(--stage-ink)]"
          >
            Go To Login
          </NuxtLink>
          <NuxtLink
            to="/signup"
            class="stitch-display border-[4px] border-(--stage-ink) bg-(--stage-cream) px-6 py-3 text-xl font-black"
          >
            Create Account
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
