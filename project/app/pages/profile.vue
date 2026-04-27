<script setup lang="ts">
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const identity = useUserIdentity();
const profile = computed(() => identity.profile.value);
const { candidateTheaters, homeTheater, homeTheaters } = useHomeTheaterState();
const isSaving = ref(false);
const saveMessage = ref<string | null>(null);
const saveError = ref<string | null>(null);
const membershipCount = computed(
  () => homeTheaters.value.length + candidateTheaters.value.length,
);

const form = reactive({
  displayName: "",
  timezone: "",
  pronouns: "",
  city: "",
  visibility: "theater_only" as "public" | "private" | "theater_only",
  bio: "",
});

watch(
  profile,
  (value) => {
    form.displayName = value?.display_name ?? "";
    form.timezone = value?.timezone ?? "UTC";
    form.pronouns = value?.pronouns ?? "";
    form.city = value?.city ?? "";
    form.visibility = value?.visibility ?? "theater_only";
    form.bio = value?.bio ?? "";
  },
  { immediate: true },
);

const saveProfile = async () => {
  saveMessage.value = null;
  saveError.value = null;
  isSaving.value = true;

  try {
    await $fetch("/api/me/profile", {
      method: "POST",
      credentials: "include",
      body: {
        displayName: form.displayName,
        timezone: form.timezone,
        pronouns: form.pronouns,
        city: form.city,
        bio: form.bio,
        visibility: form.visibility,
      },
    });

    await identity.refreshProfile();
    saveMessage.value = "Profile saved.";
  } catch (error: any) {
    saveError.value =
      error?.data?.statusMessage || error?.message || "Unable to save profile.";
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-10">
    <header class="mb-10">
      <h1 class="stitch-display text-5xl font-black md:text-7xl">Profile</h1>
      <p class="mt-2 text-lg font-bold text-(--stage-ink)/70">Identity, visibility, and theater-facing account context.</p>
    </header>

    <div class="grid gap-8 lg:grid-cols-12">
      <section class="border-[4px] border-(--stage-ink) bg-(--stage-theater) p-8 shadow-[8px_8px_0_0_var(--stage-ink)] lg:col-span-7">
        <div class="mb-6 flex items-start gap-5">
          <div class="flex h-24 w-24 items-center justify-center border-[4px] border-(--stage-ink) bg-(--stage-paper) text-3xl font-black">
            {{ identity.initials.value }}
          </div>
          <div>
            <p class="stitch-nav-label text-xs tracking-[0.22em]">Account Sheet</p>
            <h2 class="stitch-display mt-2 text-4xl font-black">{{ identity.displayName.value }}</h2>
            <p class="mt-3 text-sm font-bold uppercase text-(--stage-ink)/70">
              {{ profile?.pronouns || "Pronouns unset" }} • {{ profile?.city || "City unset" }} • {{ profile?.timezone || "Timezone unset" }}
            </p>
          </div>
        </div>

        <p class="max-w-2xl text-lg leading-relaxed">
          {{ profile?.bio || "No profile bio yet." }}
        </p>
      </section>

      <section class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)] lg:col-span-5">
        <h2 class="stitch-display mb-4 text-2xl font-black">Account Details</h2>
        <div class="space-y-4">
          <div class="border-b border-(--stage-ink)/10 pb-3">
            <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Email</p>
            <p class="mt-1 text-lg font-bold">{{ identity.email.value }}</p>
          </div>
          <div class="border-b border-(--stage-ink)/10 pb-3">
            <p class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">Home Theater</p>
            <p class="mt-1 text-lg font-bold">{{ homeTheater?.name || "No home theater selected" }}</p>
          </div>

          <div class="grid gap-4">
            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Display Name</label>
              <input v-model="form.displayName" class="stitch-input">
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Timezone</label>
                <input v-model="form.timezone" class="stitch-input">
              </div>
              <div>
                <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">City</label>
                <input v-model="form.city" class="stitch-input">
              </div>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Pronouns</label>
                <input v-model="form.pronouns" class="stitch-input">
              </div>
              <div>
                <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Visibility</label>
                <select v-model="form.visibility" class="stitch-input">
                  <option value="theater_only">Theater only</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Bio</label>
              <textarea v-model="form.bio" rows="4" class="stitch-input" />
            </div>
          </div>

          <div v-if="saveError" class="border-[4px] border-(--stage-ink) bg-(--stage-performer-soft) p-4 text-sm font-bold">
            {{ saveError }}
          </div>
          <div v-if="saveMessage" class="border-[4px] border-(--stage-ink) bg-(--stage-theater-soft) p-4 text-sm font-bold">
            {{ saveMessage }}
          </div>

          <button
            class="stitch-display border-[4px] border-(--stage-ink) bg-(--stage-event) px-6 py-3 text-xl font-black shadow-[6px_6px_0_0_var(--stage-ink)] disabled:cursor-wait disabled:opacity-70"
            :disabled="isSaving"
            @click="saveProfile"
          >
            {{ isSaving ? "Saving..." : "Save Profile" }}
          </button>
        </div>
      </section>

      <section class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)] lg:col-span-12">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="stitch-display text-3xl font-black">Membership Context</h2>
          <span class="text-sm font-black uppercase tracking-[0.18em]">
            {{ membershipCount }} active theater{{ membershipCount === 1 ? "" : "s" }}
          </span>
        </div>

        <div v-if="!membershipCount" class="text-sm font-bold text-(--stage-ink)/70">
          You do not have any active theater memberships yet.
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2">
          <article
            v-for="theater in [
              ...homeTheaters.map((entry) => ({ ...entry.theater, isHome: entry.membership.isHome })),
              ...candidateTheaters.map((theater) => ({ ...theater, isHome: false })),
            ]"
            :key="theater.id"
            class="stitch-border bg-(--stage-cream) p-5"
          >
            <h3 class="stitch-display text-2xl font-black">{{ theater.name }}</h3>
            <p class="mt-2 text-sm font-bold text-(--stage-ink)/70">{{ theater.tagline }}</p>
            <div class="mt-4 flex gap-2">
              <span class="stitch-border bg-(--stage-theater-soft) px-2 py-1 text-[10px] font-black uppercase">
                {{ theater.isHome ? "home theater" : "member" }}
              </span>
              <span class="stitch-border bg-(--stage-event-soft) px-2 py-1 text-[10px] font-black uppercase">
                active
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
