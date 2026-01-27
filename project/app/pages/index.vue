<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide">Stagecom</p>
          <h1 class="text-3xl font-bold">Walking skeleton</h1>
        </div>
      </template>

      <div class="space-y-6">
        <p>
          Create a theater, add a show with one occurrence, submit for review,
          then approve it to see it on the public listing.
        </p>

        <div class="flex flex-wrap gap-3">
          <UButton to="/theaters/new" color="primary" icon="i-heroicons-plus"
            >Create a theater</UButton
          >
          <UButton to="/theaters/demo" variant="ghost"
            >Example theater URL</UButton
          >
        </div>

        <UAlert icon="i-heroicons-information-circle">
          <template #title>Heads up</template>
          <template #description>
            Sign in first (top right), then use the links above. Producers are
            never assumed to be cast.
          </template>
        </UAlert>

        <div class="grid gap-3 sm:grid-cols-3 text-sm">
          <UCard class="sm:col-span-1" variant="soft">
            <p class="font-semibold">Create theater</p>
            <p>Owner becomes manager automatically.</p>
          </UCard>
          <UCard class="sm:col-span-1" variant="soft">
            <p class="font-semibold">Add show + occurrence</p>
            <p>Defaults to draft; submit when ready.</p>
          </UCard>
          <UCard class="sm:col-span-1" variant="soft">
            <p class="font-semibold">Review + approve</p>
            <p>Managers/staff approve to list publicly.</p>
          </UCard>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>
