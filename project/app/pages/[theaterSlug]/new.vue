<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { useCreateShow } from "~/composables/useShowMutations";
import { theaterMetaQueryOptions } from "~/queries/theaters";
import { demoTheaterDetails } from "~/utils/stitchDemo";
import { toEventPath } from "~/utils/routes";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const route = useRoute();
const slug = computed(() => String(route.params.theaterSlug || ""));
const { data } = useQuery(
  theaterMetaQueryOptions,
  computed(() => ({ slug: slug.value })),
);
const theater = computed(() => data.value?.theater ?? demoTheaterDetails.theater);
const createShow = useCreateShow(slug.value);
const formError = ref<string | null>(null);

const form = reactive({
  title: "",
  eventType: "show",
  summary: "",
  startsAt: "",
  venue: theater.value.name,
});

watch(
  theater,
  (value) => {
    form.venue = value.name;
  },
  { immediate: true },
);

const submit = async () => {
  formError.value = null;

  if (!form.title.trim() || !form.startsAt) {
    formError.value = "Title and start time are required.";
    return;
  }

  try {
    const result = await createShow.mutateAsync({
      submitForReview: true,
      payload: {
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        description: form.summary.trim() || null,
        eventType: form.eventType,
        castingMode: "invite_only",
        occurrences: [
          {
            startsAt: new Date(form.startsAt).toISOString(),
          },
        ],
      },
    });

    await navigateTo(toEventPath(result.theaterSlug, result.slug));
  } catch (error: any) {
    formError.value =
      error?.data?.statusMessage || error?.message || "Failed to create event.";
  }
};
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-10">
    <header class="mb-10">
      <p class="stitch-nav-label text-xs tracking-[0.22em] text-(--stage-theater)">Theater-Scoped Workflow</p>
      <h1 class="stitch-display mt-3 text-5xl font-black md:text-7xl">New Event</h1>
      <p class="mt-3 max-w-2xl text-lg font-bold text-(--stage-ink)/70">
        Build a new event for {{ theater.name }} with the same blunt, poster-like structure from the Stitch export.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-12">
      <section class="space-y-6 lg:col-span-8">
        <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) shadow-[8px_8px_0_0_var(--stage-ink)]">
          <header class="border-b-[4px] border-(--stage-ink) bg-(--stage-paper) p-5">
            <h2 class="stitch-display text-2xl font-black">01. Identity</h2>
          </header>
          <div class="grid gap-5 p-6 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Event Title</label>
              <input v-model="form.title" class="stitch-input" placeholder="THE UNSCRIPTED TRAGEDY">
            </div>
            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Event Type</label>
              <select v-model="form.eventType" class="stitch-input">
                <option value="show">Show</option>
                <option value="workshop">Workshop</option>
                <option value="meeting">Meeting</option>
                <option value="audition">Audition</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Summary</label>
              <textarea v-model="form.summary" rows="4" class="stitch-input" placeholder="WRITE THE BILL COPY..." />
            </div>
          </div>
        </article>

        <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) shadow-[8px_8px_0_0_var(--stage-ink)]">
          <header class="border-b-[4px] border-(--stage-ink) bg-(--stage-paper) p-5">
            <h2 class="stitch-display text-2xl font-black">02. Schedule</h2>
          </header>
          <div class="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Start Time</label>
              <input v-model="form.startsAt" type="datetime-local" class="stitch-input">
            </div>
            <div>
              <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Cast Call</label>
              <input type="time" class="stitch-input" value="18:30">
            </div>
          </div>
        </article>
      </section>

      <aside class="space-y-6 lg:col-span-4">
        <article class="border-[4px] border-(--stage-ink) bg-(--stage-ink) p-6 text-(--stage-cream) shadow-[8px_8px_0_0_var(--stage-ink)]">
          <h2 class="stitch-display mb-4 text-2xl font-black">03. Venue</h2>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-(--stage-cream)/70">Assigned Theater</label>
          <input v-model="form.venue" class="stitch-input bg-(--stage-paper)">
          <p class="mt-4 text-sm font-bold text-(--stage-cream)/80">
            Events stay explicitly theater-scoped in URL, workflow, and ownership.
          </p>
        </article>

        <div v-if="formError" class="border-[4px] border-(--stage-ink) bg-(--stage-performer-soft) p-4 text-sm font-bold text-(--stage-ink)">
          {{ formError }}
        </div>

        <button
          class="stitch-display w-full border-[4px] border-(--stage-ink) bg-(--stage-event) px-6 py-4 text-2xl font-black shadow-[8px_8px_0_0_var(--stage-ink)] disabled:cursor-wait disabled:opacity-70"
          :disabled="createShow.isLoading"
          @click="submit"
        >
          {{ createShow.isLoading ? "Creating..." : "Create Event" }}
        </button>
      </aside>
    </div>
  </div>
</template>
