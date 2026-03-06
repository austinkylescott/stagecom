<script setup lang="ts">
import type { FetchError } from "ofetch";
import { useCreateShow } from "~/composables/useShowMutations";

const route = useRoute();
const router = useRouter();

const slug = computed(() => route.params.slug as string);

const form = reactive({
  title: "",
  description: "",
  eventType: "show",
  castingMode: "direct_invite",
  startsAt: "",
  endsAt: "",
  castMin: null as number | null,
  castMax: null as number | null,
  ticketUrl: "",
});

const loading = ref(false);
const error = ref("");
const notice = ref("");

const createShow = useCreateShow(slug.value);

const submit = async (submitForReview: boolean) => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  // Basic client validation
  if (!form.title.trim()) {
    error.value = "Title is required";
    loading.value = false;
    return;
  }

  if (
    form.castMin !== null &&
    form.castMax !== null &&
    form.castMin > form.castMax
  ) {
    error.value = "Cast min cannot exceed cast max";
    loading.value = false;
    return;
  }

  if (
    form.endsAt &&
    form.startsAt &&
    new Date(form.endsAt) <= new Date(form.startsAt)
  ) {
    error.value = "End time must be after start time";
    loading.value = false;
    return;
  }

  try {
    await createShow.mutateAsync({ submitForReview, payload: { ...form } });
    notice.value = submitForReview ? "Submitted for review" : "Draft saved";
    if (submitForReview) await router.push(`/theaters/${slug.value}/review`);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Create event</h1>
        <p class="text-slate-600 text-sm">
          Set up a show, practice, meeting, or audition, then submit for review.
        </p>
      </div>
      <UButton variant="ghost" :to="`/theaters/${slug}/review`"
        >Review queue</UButton
      >
    </div>

    <UCard>
      <div class="space-y-6">
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Title" required>
            <UInput v-model="form.title" placeholder="Harold Night" />
          </UFormField>
          <UFormField label="Event Type">
            <URadioGroup
              variant="table"
              v-model="form.eventType"
              :items="[
                {
                  label: 'Show',
                  description: 'A ticketed performance open to the public',
                  value: 'show',
                },
                {
                  label: 'Practice',
                  description: 'A rehearsal for a team or specific show',
                  value: 'practice',
                },
                {
                  label: 'Meeting',
                  description: 'A meeting with working groups',
                  value: 'meeting',
                },
                {
                  label: 'Audition',
                  description:
                    'An audition for a specific show or general casting call',
                  value: 'audition',
                },
                {
                  label: 'Workshop',
                  description: 'A short class open to community members',
                  value: 'workshop',
                },
              ]"
            />
          </UFormField>
        </div>

        <UFormField
          label="Description"
          description="What is this about?"
          required
        >
          <UTextarea v-model="form.description" :rows="4" />
        </UFormField>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField
            label="Casting mode"
            description="Who can request or be invited?"
          >
            <USelect
              v-model="form.castingMode"
              :options="[
                { label: 'Direct invite', value: 'direct_invite' },
                { label: 'Theater casting', value: 'theater_casting' },
                { label: 'Public casting', value: 'public_casting' },
              ]"
            />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Cast min">
              <UInput
                v-model.number="form.castMin"
                type="number"
                min="0"
                placeholder="e.g. 6"
              />
            </UFormField>
            <UFormField label="Cast max">
              <UInput
                v-model.number="form.castMax"
                type="number"
                min="0"
                placeholder="e.g. 10"
              />
            </UFormField>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Start" description="Local time">
            <UInput type="datetime-local" v-model="form.startsAt" />
          </UFormField>
          <UFormField label="End" description="Optional">
            <UInput type="datetime-local" v-model="form.endsAt" />
          </UFormField>
        </div>

        <UFormField label="Ticket URL" description="Optional">
          <UInput
            v-model="form.ticketUrl"
            placeholder="https://tickets.example.com"
          />
        </UFormField>

        <div class="flex items-center gap-3 flex-wrap">
          <UButton :loading="loading" color="primary" @click="submit(true)">
            Submit for review
          </UButton>
          <UButton :loading="loading" variant="ghost" @click="submit(false)">
            Save as draft
          </UButton>
          <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
