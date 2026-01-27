<script setup lang="ts">
const { data, pending, error, refresh } = useAsyncData(
  () =>
    $fetch<{ theaters: any[]; myTheaters: any[] }>("/api/theaters", {
      credentials: "include",
    }),
  { server: false },
);
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Theaters</h1>
        <p class="text-slate-600">
          Browse all theaters and the ones you're part of.
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" to="/theaters/new"
        >Create theater</UButton
      >
    </div>

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <p class="font-semibold">My theaters</p>
            <UButton
              size="xs"
              variant="ghost"
              icon="i-heroicons-arrow-path"
              @click="refresh"
            />
          </div>
        </template>
        <div v-if="pending" class="text-sm text-slate-600">Loading...</div>
        <div
          v-else-if="(data?.myTheaters?.length || 0) === 0"
          class="text-sm text-slate-600"
        >
          You're not a member yet. Join or create a theater to see it here.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="theater in data?.myTheaters"
            :key="theater.id"
            class="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
          >
            <div>
              <p class="font-semibold">{{ theater.name }}</p>
              <p class="text-xs text-slate-600">
                Timezone: {{ theater.timezone }}
              </p>
            </div>
            <UButton size="xs" :to="`/theaters/${theater.slug}`">Open</UButton>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-semibold">All theaters</div>
        </template>
        <div v-if="pending" class="text-sm text-slate-600">Loading...</div>
        <div v-else class="space-y-3">
          <div
            v-for="theater in data?.theaters || []"
            :key="theater.id"
            class="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
          >
            <div>
              <p class="font-semibold">{{ theater.name }}</p>
              <p class="text-xs text-slate-600">
                Timezone: {{ theater.timezone }}
              </p>
            </div>
            <UButton size="xs" :to="`/theaters/${theater.slug}`">View</UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
