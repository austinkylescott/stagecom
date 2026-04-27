<script setup lang="ts">
const supabase = useSupabaseClient();
const authError = ref<string | null>(null);
const isSubmitting = ref(false);

const state = reactive({
  name: "",
  email: "",
  password: "",
  confirm: "",
});

const onSubmit = async () => {
  authError.value = null;

  if (state.password !== state.confirm) {
    authError.value = "Passwords must match.";
    return;
  }

  isSubmitting.value = true;

  const { data, error } = await supabase.auth.signUp({
    email: state.email,
    password: state.password,
    options: {
      data: {
        full_name: state.name,
      },
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/confirm` : undefined,
    },
  });

  isSubmitting.value = false;

  if (error) {
    authError.value = error.message;
    return;
  }

  await navigateTo(data.user?.aud === "authenticated" ? "/callsheet" : "/confirm");
};
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 pt-16 md:grid-cols-2">
    <section class="flex items-center justify-center bg-(--stage-cream) p-6 md:p-10">
      <div class="w-full max-w-xl stitch-border-heavy bg-(--stage-paper) stitch-shadow-lg">
        <div class="border-b-[4px] border-(--stage-ink) bg-(--stage-theater) p-6">
          <p class="stitch-nav-label text-xs tracking-[0.22em] text-(--stage-ink)">Join Stagecom</p>
          <h1 class="stitch-display mt-3 text-4xl font-black">Create Your Account</h1>
        </div>

        <form class="space-y-5 p-6 md:p-8" @submit.prevent="onSubmit">
          <div>
            <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em]">Full Name</label>
            <input v-model="state.name" required class="stitch-input" placeholder="HOW SHOULD WE GREET YOU?">
          </div>

          <div>
            <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em]">Email</label>
            <input v-model="state.email" type="email" required class="stitch-input" placeholder="YOU@THEATER.COM">
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em]">Password</label>
              <input v-model="state.password" type="password" required class="stitch-input" placeholder="CREATE PASSWORD">
            </div>

            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.2em]">Confirm</label>
              <input v-model="state.confirm" type="password" required class="stitch-input" placeholder="REPEAT PASSWORD">
            </div>
          </div>

          <div v-if="authError" class="stitch-border bg-(--stage-performer-soft) p-4 text-sm font-bold">
            {{ authError }}
          </div>

          <button
            type="submit"
            class="stitch-display w-full border-[4px] border-(--stage-ink) bg-(--stage-event) px-6 py-4 text-2xl font-black shadow-[6px_6px_0_0_var(--stage-ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--stage-ink)] disabled:cursor-wait disabled:opacity-70"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Signing Up..." : "Join Now" }}
          </button>

          <p class="text-sm font-bold uppercase">
            Already have an account?
            <NuxtLink to="/login" class="underline underline-offset-4">Log in</NuxtLink>
          </p>
        </form>
      </div>
    </section>

    <section class="flex flex-col justify-between border-t-[4px] border-(--stage-ink) bg-(--stage-ink) p-8 text-(--stage-cream) md:border-l-[4px] md:border-t-0 md:p-12">
      <div>
        <p class="stitch-nav-label mb-8 text-sm text-(--stage-event)">Enrollment Sheet</p>
        <h2 class="stitch-display text-6xl font-black md:text-7xl">Step Into The Network.</h2>
        <p class="mt-6 max-w-xl text-lg font-medium text-(--stage-cream)/80">
          Build your profile, join theaters, and get onto the callsheet without leaving the same system.
        </p>
      </div>
      <div class="space-y-4 text-sm font-black uppercase tracking-[0.18em]">
        <div class="border-l-[4px] border-(--stage-theater) pl-4">Theater identity</div>
        <div class="border-l-[4px] border-(--stage-event) pl-4">Event creation</div>
        <div class="border-l-[4px] border-(--stage-performer) pl-4">Performer context</div>
      </div>
    </section>
  </div>
</template>
