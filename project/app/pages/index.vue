<script setup lang="ts">
const { isAuthed } = useUserIdentity();

const primaryCta = computed(() => (isAuthed.value ? "/callsheet" : "/signup"));
</script>

<template>
  <div class="pb-24 pt-16 md:pb-0">
    <section class="grid min-h-[819px] border-b-[4px] border-(--stage-ink) md:grid-cols-2">
      <div class="flex flex-col justify-center gap-8 bg-(--stage-paper) p-8 md:p-16">
        <div
          class="self-start border-2 border-(--stage-ink) bg-(--stage-event) px-4 py-1 shadow-[4px_4px_0_0_var(--stage-ink)]"
        >
          <span class="stitch-nav-label text-sm tracking-[0.2em]">Improv Management System</span>
        </div>

        <h1 class="stitch-display text-6xl font-black md:text-8xl">
          The Analog <span class="text-(--stage-performer)">Stage</span> Digitalized.
        </h1>

        <p class="max-w-xl text-xl font-medium md:text-2xl">
          Ditch the messy spreadsheets and forgotten group chats. Stagecom is the
          letterpress-inspired operating system for theaters, performers, and creators.
        </p>

        <div class="flex flex-wrap gap-4">
          <NuxtLink
            :to="primaryCta"
            class="stitch-display border-[4px] border-(--stage-ink) bg-(--stage-theater) px-8 py-4 text-2xl font-black shadow-[6px_6px_0_0_var(--stage-ink)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--stage-ink)]"
          >
            Get Access
          </NuxtLink>
          <NuxtLink
            to="/dev/components"
            class="stitch-display border-[4px] border-(--stage-ink) bg-(--stage-cream) px-8 py-4 text-2xl font-black hover:bg-[color:color-mix(in_srgb,var(--stage-paper)_75%,white)]"
          >
            Watch Demo
          </NuxtLink>
        </div>
      </div>

      <div class="relative flex items-center justify-center overflow-hidden bg-(--stage-ink) p-8">
        <div
          class="relative h-full max-h-[600px] w-full border-[4px] border-(--stage-theater) bg-(--stage-cream) shadow-[12px_12px_0_0_var(--stage-performer)]"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUWw7WmXx4S-mLfWZBdg82juvTOggeoWBa9kYgQbLwv3PlBgx4Gfhz3TsID4N_0O2xQu9LrAY5k0zaX5tGTzp80NUK4__Pzgr2Gd37DXOqw2N7Cfrcg_l-pBqSDSoVMqzzXUsA0rm7H1hhDFGf1crfaqoLwoqcSt0EOlp684YCcu6u8yBIndK1t-wYtmjm7N2PfBKErPPsA-LSCkTe8LSaABqyeAy21ieRkQBEBy7WzqTttKvcIw-D98Zyx7xp4PFdzH_HsUv4PV8"
            alt="Improv show on stage"
            class="h-full w-full object-cover grayscale"
          >
          <div
            class="absolute left-6 top-6 border-2 border-(--stage-ink) bg-(--stage-event) p-4 font-display text-3xl uppercase shadow-[4px_4px_0_0_var(--stage-ink)]"
          >
            Live Tonight
          </div>
        </div>
      </div>
    </section>

    <section class="bg-(--stage-cream) p-8 md:p-16">
      <div class="mb-12">
        <h2 class="stitch-display mb-4 text-5xl font-black">
          Built For The <span class="text-(--stage-theater)">Chaos</span> Of Creation
        </h2>
        <div class="h-1 w-32 bg-(--stage-ink)" />
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
        <article class="md:col-span-8 stitch-border-heavy bg-(--stage-paper) stitch-shadow-lg">
          <div class="flex items-center justify-between border-b-[4px] border-(--stage-ink) bg-(--stage-theater) p-4">
            <span class="stitch-display text-xl font-black">Dynamic Callsheets</span>
            <span class="text-2xl">■</span>
          </div>

          <div class="grid items-center gap-8 p-8 md:grid-cols-2">
            <div>
              <p class="mb-4 text-xl font-bold">
                Real-time schedule synchronization for cast and crew. No more
                "what time is soundcheck?"
              </p>
              <ul class="space-y-3 font-bold">
                <li>■ Automated reminders</li>
                <li>■ Stage-door access logs</li>
                <li>■ Digital prop tracking</li>
              </ul>
            </div>

            <div class="bg-(--stage-ink) p-2">
              <div class="border-2 border-(--stage-ink) bg-white p-4 text-xs">
                <div class="mb-2 border-b-2 border-(--stage-ink) pb-2 font-black">
                  CALLSHEET // OCT-24-2026
                </div>
                <div class="flex justify-between border-b border-black/10 py-1">
                  <span>18:00</span>
                  <span class="bg-(--stage-event) px-1">HOUSE OPENS</span>
                </div>
                <div class="flex justify-between border-b border-black/10 py-1">
                  <span>19:30</span>
                  <span>CURTAIN CALL</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>21:00</span>
                  <span>STRIKE</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="stitch-border-heavy stitch-shadow-lg flex flex-col justify-between bg-(--stage-performer) p-8 text-(--stage-cream) md:col-span-4">
          <div>
            <div class="mb-4 text-5xl">●</div>
            <h3 class="stitch-display mb-4 text-4xl font-black">The Cast Directory</h3>
          </div>
          <p class="font-bold">
            A living archive of your community. Track specialties, availability, and
            workshop history in one bold ledger.
          </p>
        </article>

        <article class="stitch-border-heavy stitch-shadow-lg bg-(--stage-event) p-8 md:col-span-4">
          <h3 class="stitch-display mb-6 text-4xl font-black">Theater Network</h3>
          <div class="space-y-4">
            <div class="stitch-panel-cream p-4">
              <div class="text-sm font-black uppercase">The PIT NY</div>
              <div class="text-xs font-bold opacity-70">3 stages • active</div>
            </div>
            <div class="border-2 border-(--stage-ink) bg-(--stage-paper)/70 p-4">
              <div class="text-sm font-black uppercase">Second City Chi</div>
              <div class="text-xs font-bold opacity-70">Rehearsal in progress</div>
            </div>
          </div>
        </article>

        <article class="stitch-border-heavy stitch-shadow-lg bg-(--stage-paper) p-8 md:col-span-8">
          <div class="flex flex-col items-center gap-8 md:flex-row">
            <div class="flex-1">
              <h3 class="stitch-display mb-4 text-4xl font-black">Inbound System</h3>
              <p class="text-lg font-bold">
                Centralized notifications that actually matter. Audition results,
                schedule changes, and community announcements delivered with brutalist clarity.
              </p>
            </div>
            <div class="flex h-32 w-32 items-center justify-center bg-(--stage-ink) text-(--stage-theater)">
              <span class="text-6xl">!</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="relative overflow-hidden border-y-[4px] border-(--stage-ink) bg-(--stage-ink) px-8 py-20 text-(--stage-cream)">
      <div class="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
        <div class="border-l-[4px] border-(--stage-theater) pl-6">
          <div class="stitch-display text-7xl font-black text-(--stage-theater)">450+</div>
          <div class="stitch-display text-2xl font-bold">Theaters Mapped</div>
        </div>
        <div class="border-l-[4px] border-(--stage-event) pl-6">
          <div class="stitch-display text-7xl font-black text-(--stage-event)">12K</div>
          <div class="stitch-display text-2xl font-bold">Performers Synced</div>
        </div>
        <div class="border-l-[4px] border-(--stage-performer) pl-6">
          <div class="stitch-display text-7xl font-black text-(--stage-performer)">98%</div>
          <div class="stitch-display text-2xl font-bold">Less Chaos</div>
        </div>
      </div>
      <div class="pointer-events-none absolute -bottom-10 -right-10 opacity-10 font-display text-[20rem] font-black uppercase">
        Improv
      </div>
    </section>
  </div>
</template>
