<script setup lang="ts">
const user = useSupabaseUser();
const { data, isLoading, error, refresh } = usePerformers();

const search = ref("");

const sharedCounts = computed(() => {
  const myId = user.value?.id;
  const map = new Map<string, number>();
  const memberships = data.value?.memberships || [];

  const byUser = memberships.reduce((acc: Map<string, Set<string>>, m: any) => {
    const set = acc.get(m.user_id) || new Set<string>();
    set.add(m.theater_id);
    acc.set(m.user_id, set);
    return acc;
  }, new Map());

  const myTheaters = byUser.get(myId || "") || new Set<string>();

  for (const [uid, theaters] of byUser.entries()) {
    if (!myId || uid === myId) continue;
    const overlap = [...theaters].filter((t) => myTheaters.has(t)).length;
    map.set(uid, overlap);
  }

  return map;
});

const filteredProfiles = computed(() => {
  const term = search.value.toLowerCase();
  return (data.value?.profiles || []).filter((p: any) => {
    const name = p.display_name || p.id;
    return name.toLowerCase().includes(term);
  });
});
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Performers</h1>
        <p class="text-slate-600">
          Discover performers, see who you share stages with, and invite new
          voices.
        </p>
      </div>
      <UButton icon="i-heroicons-arrow-path" variant="ghost" @click="refresh"
        >Refresh</UButton
      >
    </div>

    <UInput
      v-model="search"
      placeholder="Search performers by name"
      icon="i-heroicons-magnifying-glass"
      class="max-w-md"
    />

    <div v-if="error" class="text-sm text-red-600">
      {{ error?.message || error?.data?.message }}
    </div>

    <div v-if="isLoading" class="text-sm text-slate-600">
      Loading performers...
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="performer in filteredProfiles" :key="performer.id">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="performer.avatar_url"
            :text="performer.display_name?.[0] || 'P'"
          />
          <div>
            <p class="font-semibold">
              {{ performer.display_name || "Unnamed performer" }}
            </p>
            <p class="text-xs text-slate-600">
              Shared theaters: {{ sharedCounts.get(performer.id) || 0 }}
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton size="xs" color="primary" variant="soft" :disabled="!user">
              Invite to show
            </UButton>
            <UButton size="xs" variant="ghost">View profile</UButton>
          </div>
        </template>
      </UCard>
    </div>

    <div class="text-xs text-slate-500">
      Social clustering v1 uses shared theater membership as a proxy for “play
      together”. We can extend this to co-cast counts when cast data lands.
    </div>
  </div>
</template>
