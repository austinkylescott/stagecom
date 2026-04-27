<template>
  <div class="bg-(--stage-cream) p-6 pt-20 md:p-12 md:pt-24">
    <header class="mb-10">
      <p class="stitch-nav-label text-xs tracking-[0.22em] text-(--stage-event)">Internal Reference</p>
      <h1 class="stitch-display mt-3 text-5xl font-black md:text-8xl">The Analog Stage</h1>
      <p class="mt-4 max-w-3xl text-lg font-bold text-(--stage-ink)/70">
        Permanent component and page-pattern reference for the Stitch-based redesign implementation.
      </p>
    </header>

    <section class="mb-8 grid gap-6 md:grid-cols-3">
      <article class="border-[4px] border-(--stage-ink) bg-(--stage-theater) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]">
        <h2 class="stitch-display text-3xl font-black">Mint / Theater</h2>
      </article>
      <article class="border-[4px] border-(--stage-ink) bg-(--stage-event) p-6 shadow-[8px_8px_0_0_var(--stage-ink)]">
        <h2 class="stitch-display text-3xl font-black">Amber / Event</h2>
      </article>
      <article class="border-[4px] border-(--stage-ink) bg-(--stage-performer) p-6 text-(--stage-cream) shadow-[8px_8px_0_0_var(--stage-ink)]">
        <h2 class="stitch-display text-3xl font-black">Coral / Performer</h2>
      </article>
    </section>

    <section class="grid gap-8 lg:grid-cols-12">
      <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)] lg:col-span-7">
        <h2 class="stitch-display mb-6 text-4xl font-black">Buttons & Interactive States</h2>
        <div class="flex flex-wrap gap-4">
          <button class="border-[4px] border-(--stage-ink) bg-(--stage-theater) px-6 py-3 text-sm font-black uppercase shadow-[6px_6px_0_0_var(--stage-ink)]">
            Primary
          </button>
          <button class="border-[4px] border-(--stage-ink) bg-(--stage-event) px-6 py-3 text-sm font-black uppercase shadow-[6px_6px_0_0_var(--stage-ink)]">
            Accent
          </button>
          <button class="border-[4px] border-(--stage-ink) bg-(--stage-paper) px-6 py-3 text-sm font-black uppercase">
            Neutral
          </button>
        </div>
      </article>

      <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)] lg:col-span-5">
        <h2 class="stitch-display mb-4 text-3xl font-black">Form Fields</h2>
        <div class="space-y-4">
          <input class="stitch-input" placeholder="YOUR_EMAIL@THEATER.COM">
          <textarea class="stitch-input" rows="4" placeholder="WRITE COPY..." />
        </div>
      </article>

      <article class="border-[4px] border-(--stage-ink) bg-(--stage-paper) p-6 shadow-[8px_8px_0_0_var(--stage-ink)] lg:col-span-12">
        <h2 class="stitch-display mb-6 text-4xl font-black">Composite Panels</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="stitch-panel-cream p-5">
            <h3 class="stitch-display text-2xl font-black">Card</h3>
            <p class="mt-2 text-sm font-bold text-(--stage-ink)/70">Paper-first surfaces with ink borders and hard shadows.</p>
          </div>
          <div class="stitch-panel-mint p-5">
            <h3 class="stitch-display text-2xl font-black">Header Block</h3>
            <p class="mt-2 text-sm font-bold text-(--stage-ink)/70">Color carries context, not decoration.</p>
          </div>
          <div class="stitch-panel-amber p-5">
            <h3 class="stitch-display text-2xl font-black">Action Block</h3>
            <p class="mt-2 text-sm font-bold text-(--stage-ink)/70">Calls to action stay loud and square.</p>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
