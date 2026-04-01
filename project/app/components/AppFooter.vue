<template>
  <footer class="bg-(--stage-ink)">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-8 md:grid-cols-4">
        <div class="md:col-span-2">
          <NuxtLink to="/" class="inline-block font-display text-3xl text-(--stage-cream)">
            Stagecom
          </NuxtLink>
          <p class="mt-4 max-w-sm leading-7 text-[rgba(251,247,239,0.7)]">
            The community management platform for improv theaters, ensembles,
            and local performance communities.
          </p>
          <div class="mt-6 flex gap-3">
            <a href="#" aria-label="Twitter" class="flex size-10 items-center justify-center border-2 border-[rgba(251,247,239,0.3)] text-[rgba(251,247,239,0.7)] transition-colors hover:border-(--stage-gold) hover:text-(--stage-gold)">
              X
            </a>
            <a href="#" aria-label="Instagram" class="flex size-10 items-center justify-center border-2 border-[rgba(251,247,239,0.3)] text-[rgba(251,247,239,0.7)] transition-colors hover:border-(--stage-gold) hover:text-(--stage-gold)">
              IG
            </a>
          </div>
        </div>

        <div>
          <h3 class="mb-4 font-bold text-(--stage-cream)">Product</h3>
          <ul class="space-y-2 text-[rgba(251,247,239,0.7)]">
            <li><a href="/#features" class="transition-colors hover:text-(--stage-gold)">Features</a></li>
            <li><a href="/#roles" class="transition-colors hover:text-(--stage-gold)">For Your Role</a></li>
            <li><a href="/#product" class="transition-colors hover:text-(--stage-gold)">Product Preview</a></li>
            <li><a href="/#waitlist" class="transition-colors hover:text-(--stage-gold)">Join Waitlist</a></li>
          </ul>
        </div>

        <div>
          <h3 class="mb-4 font-bold text-(--stage-cream)">Company</h3>
          <ul class="space-y-2 text-[rgba(251,247,239,0.7)]">
            <li><a href="#" class="transition-colors hover:text-(--stage-gold)">About</a></li>
            <li><a href="#" class="transition-colors hover:text-(--stage-gold)">Contact</a></li>
            <li><a href="#" class="transition-colors hover:text-(--stage-gold)">Privacy</a></li>
            <li><a href="#" class="transition-colors hover:text-(--stage-gold)">Terms</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t-2 border-[rgba(251,247,239,0.2)] pt-8 md:flex-row">
        <p class="text-sm text-[rgba(251,247,239,0.5)]">
          © 2026 Stagecom. Built for improv communities.
        </p>
        <p class="text-sm text-[rgba(251,247,239,0.5)]">
          Made with care in the local scene.
        </p>
      </div>
    </div>
  </footer>
</template>
