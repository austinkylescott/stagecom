<script setup lang="ts">
const supabase = useSupabaseClient();
const route = useRoute();
const authError = ref<string | null>(null);
const isSubmitting = ref(false);
const email = ref("");
const password = ref("");

const redirectTarget = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/callsheet";
});

const onSubmit = async () => {
  authError.value = null;
  isSubmitting.value = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  isSubmitting.value = false;

  if (error) {
    authError.value = error.message;
    return;
  }

  await navigateTo(redirectTarget.value);
};
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 pt-16 md:grid-cols-2">
    <section class="flex flex-col justify-between border-b-[4px] border-(--stage-ink) bg-(--stage-ink) p-8 text-(--stage-cream) md:border-b-0 md:border-r-[4px] md:p-12">
      <div>
        <p class="stitch-nav-label mb-8 text-sm text-(--stage-theater)">Stagecom Access Terminal</p>
        <h1 class="stitch-display text-6xl font-black md:text-7xl">Run The Scene.</h1>
        <p class="mt-6 max-w-xl text-lg font-medium text-(--stage-cream)/80">
          Sign in to your callsheet, theater roster, notifications, and production board.
        </p>
      </div>
      <div class="mt-12 border-l-[4px] border-(--stage-event) pl-4 text-sm font-black uppercase tracking-[0.2em]">
        Built for performers, producers, and theater crews.
      </div>
    </section>

    <section class="flex items-center justify-center bg-(--stage-paper) p-6 md:p-10">
      <div class="w-full max-w-xl stitch-border-heavy bg-(--stage-cream) stitch-shadow-lg">
        <div class="border-b-[4px] border-(--stage-ink) bg-(--stage-paper) p-6">
          <p class="stitch-nav-label text-xs tracking-[0.22em] text-(--stage-theater)">Login</p>
          <h2 class="stitch-display mt-3 text-4xl font-black">Identify Yourself</h2>
        </div>

        <form class="space-y-5 p-6 md:p-8" @submit.prevent="onSubmit">
          <div>
            <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em]">Email</label>
            <input v-model="email" type="email" required class="stitch-input" placeholder="YOU@THEATER.COM">
          </div>

          <div>
            <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em]">Password</label>
            <input
              v-model="password"
              type="password"
              required
              class="stitch-input"
              placeholder="ENTER YOUR PASSWORD"
            >
          </div>

          <div v-if="authError" class="stitch-border bg-(--stage-performer-soft) p-4 text-sm font-bold">
            {{ authError }}
          </div>

          <button
            type="submit"
            class="stitch-display w-full border-[4px] border-(--stage-ink) bg-(--stage-event) px-6 py-4 text-2xl font-black shadow-[6px_6px_0_0_var(--stage-ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--stage-ink)] disabled:cursor-wait disabled:opacity-70"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Entering..." : "Enter Stagecom" }}
          </button>

          <div class="flex items-center justify-between gap-4 text-sm font-bold uppercase">
            <NuxtLink to="/signup" class="underline underline-offset-4">Need an account?</NuxtLink>
            <NuxtLink to="/confirm" class="underline underline-offset-4">Confirm sign up</NuxtLink>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>
