<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { theatersQueryOptions } from "~/queries/theaters";
import { toTheaterPath } from "~/utils/routes";
import { demoTheaters } from "~/utils/stitchDemo";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const search = ref("");

const params = computed(() => ({
  search: search.value,
  sort: "name_asc" as const,
  page: 1,
  pageSize: 20,
}));

const { data } = useQuery(theatersQueryOptions, params);

const theaters = computed(() => (data.value?.theaters?.length ? data.value : demoTheaters));
const featured = computed(() => theaters.value.myTheaters[0] ?? theaters.value.theaters[0]);
const secondary = computed(() => theaters.value.theaters.slice(0, 2));
const showCreateForm = ref(false);
const isCreating = ref(false);
const createError = ref<string | null>(null);
const createForm = reactive({
  name: "",
  tagline: "",
  timezone: "America/Chicago",
  street: "",
  city: "",
  state_region: "",
  postal_code: "",
  country: "USA",
});

const createTheater = async () => {
  createError.value = null;
  isCreating.value = true;

  try {
    const created = await $fetch<{ slug: string }>("/api/theaters", {
      method: "POST",
      credentials: "include",
      body: createForm,
    });

    await navigateTo(toTheaterPath(created.slug));
  } catch (error: any) {
    createError.value =
      error?.data?.statusMessage || error?.message || "Failed to create theater.";
  } finally {
    isCreating.value = false;
  }
};
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-12">
    <header class="mb-12">
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="stitch-display mb-4 text-5xl font-black md:text-7xl">Theaters</h1>
          <p class="max-w-2xl border-l-[4px] border-(--stage-theater) pl-4 text-xl font-bold text-(--stage-ink)/70">
            Discover the physical spaces keeping the art of improv alive. From back-alley basements to historic mainstages.
          </p>
        </div>

        <NuxtLink
          to="/theaters"
          class="flex items-center gap-2 border-2 border-(--stage-ink) bg-(--stage-theater) px-8 py-4 text-sm font-black uppercase shadow-[6px_6px_0_0_var(--stage-ink)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          @click.prevent="showCreateForm = !showCreateForm"
        >
          <span>+</span>
          <span>{{ showCreateForm ? "Hide Create Form" : "Create Theater" }}</span>
        </NuxtLink>
      </div>
    </header>

    <section
      v-if="showCreateForm"
      class="mb-10 border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]"
    >
      <div class="mb-6">
        <h2 class="stitch-display text-3xl font-black">New Theater</h2>
        <p class="mt-2 text-sm font-bold text-(--stage-ink)/70">
          This now hits the existing theater create endpoint instead of dead-ending.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Name</label>
          <input v-model="createForm.name" class="stitch-input">
        </div>
        <div class="md:col-span-2">
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Tagline</label>
          <input v-model="createForm.tagline" class="stitch-input">
        </div>
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Timezone</label>
          <input v-model="createForm.timezone" class="stitch-input">
        </div>
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Street</label>
          <input v-model="createForm.street" class="stitch-input">
        </div>
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">City</label>
          <input v-model="createForm.city" class="stitch-input">
        </div>
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">State / Region</label>
          <input v-model="createForm.state_region" class="stitch-input">
        </div>
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Postal Code</label>
          <input v-model="createForm.postal_code" class="stitch-input">
        </div>
        <div>
          <label class="mb-2 block text-xs font-black uppercase tracking-[0.18em]">Country</label>
          <input v-model="createForm.country" class="stitch-input">
        </div>
      </div>

      <div v-if="createError" class="mt-4 border-[4px] border-(--stage-ink) bg-(--stage-performer-soft) p-4 text-sm font-bold">
        {{ createError }}
      </div>

      <button
        class="stitch-display mt-6 border-[4px] border-(--stage-ink) bg-(--stage-event) px-6 py-3 text-xl font-black shadow-[6px_6px_0_0_var(--stage-ink)] disabled:cursor-wait disabled:opacity-70"
        :disabled="isCreating"
        @click="createTheater"
      >
        {{ isCreating ? "Creating..." : "Create Theater" }}
      </button>
    </section>

    <div class="mb-10 flex flex-wrap gap-4 border-2 border-(--stage-ink) bg-(--stage-paper) p-6">
      <div class="min-w-[280px] flex-1">
        <input v-model="search" class="stitch-input pl-4" placeholder="FIND A STAGE...">
      </div>
      <div class="flex gap-2">
        <button class="stitch-border bg-(--stage-cream) px-4 py-3 text-xs font-bold uppercase">Mainstage</button>
        <button class="stitch-border bg-(--stage-cream) px-4 py-3 text-xs font-bold uppercase">Workshop</button>
        <button class="stitch-border bg-(--stage-cream) px-4 py-3 text-xs font-bold uppercase">Touring</button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-12">
      <article class="overflow-hidden border-2 border-(--stage-ink) bg-(--stage-paper) shadow-[8px_8px_0_0_var(--stage-ink)] md:col-span-8 md:flex">
        <div class="h-64 overflow-hidden border-b-2 border-(--stage-ink) md:h-auto md:w-1/2 md:border-b-0 md:border-r-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB156GmLi55mhkx_ojmGzbbtMaDNIYWtF35UO_ZT6Rm1aTddKcd_2DS5lj-3RbhaaNXjjblfuVYuHpQJiDTfdjIr1h6S9IJX6LzSf7z1aaRzdtqYfTuzK92dEuK6eQAwvX6B60dVQ8d-CkCB4_r8Mmk9VjYOVtbXyAY8s4kcd8-AeagpF_86gssUmNzoJn_D5OJEOBKTLH7pCrCOuCJ7Gi-MHCbyEN7EsY0r0-JvHaBM_53l76zLexI3h_eNva-CvZzS2tpacWaCyc"
            alt="Historic theater interior"
            class="h-full w-full object-cover grayscale"
          >
        </div>

        <div class="flex flex-1 flex-col">
          <div class="border-b-2 border-(--stage-ink) bg-(--stage-theater) p-6">
            <div class="flex items-start justify-between gap-4">
              <h2 class="stitch-display text-4xl font-black">{{ featured.name }}</h2>
              <span class="text-xl">✓</span>
            </div>
          </div>

          <div class="flex flex-1 flex-col justify-between p-6">
            <p class="mb-6 leading-relaxed text-(--stage-ink)/80">
              {{ featured.tagline || "A flagship venue hosting long-form improv residencies and community classes." }}
            </p>
            <div class="mb-8 flex flex-wrap gap-2">
              <span class="stitch-border bg-(--stage-cream) px-2 py-1 text-[10px] font-black uppercase">200 Cap</span>
              <span class="stitch-border bg-(--stage-cream) px-2 py-1 text-[10px] font-black uppercase">Bar On-Site</span>
              <span class="stitch-border bg-(--stage-cream) px-2 py-1 text-[10px] font-black uppercase">ADA Compliant</span>
            </div>
            <NuxtLink
              :to="toTheaterPath(featured.slug)"
              class="stitch-display inline-flex w-full items-center justify-center bg-(--stage-ink) px-6 py-3 text-lg font-black text-(--stage-cream)"
            >
              View Schedule
            </NuxtLink>
          </div>
        </div>
      </article>

      <article
        v-for="(theater, index) in secondary"
        :key="theater.id"
        class="flex flex-col border-2 border-(--stage-ink) bg-(--stage-paper) shadow-[8px_8px_0_0_var(--stage-ink)] md:col-span-4"
      >
        <div class="border-b-2 border-(--stage-ink) p-4" :class="index === 0 ? 'bg-(--stage-event)' : 'bg-(--stage-performer)'">
          <h3 class="stitch-display text-2xl font-black">{{ theater.name }}</h3>
        </div>
        <div class="flex flex-1 flex-col p-6">
          <p class="mb-6 text-sm text-(--stage-ink)/75">
            {{ theater.tagline || "Community-driven venue focused on ensembles, classes, and grassroots troupes." }}
          </p>
          <NuxtLink
            :to="toTheaterPath(theater.slug)"
            class="mt-auto border-2 border-(--stage-ink) bg-(--stage-cream) px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em]"
          >
            Visit Theater
          </NuxtLink>
        </div>
      </article>

      <div class="relative h-80 overflow-hidden border-2 border-(--stage-ink) bg-(--stage-paper) shadow-[8px_8px_0_0_var(--stage-ink)] md:col-span-8">
        <div class="absolute left-4 top-4 z-10 border-2 border-(--stage-theater) bg-(--stage-ink) p-4 text-(--stage-cream)">
          <p class="stitch-display text-sm font-black">Local Circuit Map</p>
        </div>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLE6vCzycT1VlkEdjdhL-QdAzFfknNydcsg3mWwspGWFZ1Awuuf_KYBcXl7KGJ8QqQFQy8drAdO8Wrh0oIV272rRq8i_agGkAfPifoNZXoQthdsC3CuEPw3PHtaDPnp-e8rQ0LbhClp3fDXht1_xWecGniFq2_r7vEa5QquToSox8VqjxjnnvK85CXUjjhdpY7FsQiF0XIBz3TStNbUBInrN6tDFKTmaCMHDi6kc5_VklINng2mvFt4T0m0nNtF8UprIVjtk5zjP0"
          alt="Map"
          class="h-full w-full object-cover grayscale"
        >
      </div>
    </div>
  </div>
</template>
