<script setup lang="ts">
import { useRequestHeaders } from "#app";
import type { FetchError } from "ofetch";
import ShowBuilderEditor from "~/components/ShowBuilderEditor.vue";
import { useCreateShow } from "~/composables/useShowMutations";
import type { TheaterMeta } from "~/queries/theaters";
import type { PerformersResponse } from "~/queries/people";
import {
  createEmptyOccurrence,
  createEmptyShowBuilderForm,
  createEmptyStaffAssignment,
  toCreateShowPayload,
} from "~/utils/showBuilder";

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

const { data: meta } = await useAsyncData(
  () =>
    $fetch<TheaterMeta>(`/api/theaters/${slug.value}/meta`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const theaterId = computed(() => meta.value?.theater.id);

const { data: initialMembers } = await useAsyncData(
  () => {
    if (!theaterId.value) {
      return Promise.resolve<PerformersResponse>({
        profiles: [],
        memberships: [],
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 1,
      });
    }

    return $fetch<PerformersResponse>("/api/performers", {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
      params: {
        theaterId: theaterId.value,
        page: 1,
        pageSize: 50,
      },
    });
  },
  { server: true, watch: [theaterId] },
);

const form = reactive(createEmptyShowBuilderForm());
const loading = ref(false);
const error = ref("");
const notice = ref("");

const createShow = useCreateShow(slug.value);

const memberOptions = computed(() =>
  (initialMembers.value?.profiles ?? []).map((profile) => ({
    label: profile.display_name || "Unnamed member",
    value: profile.id,
  })),
);

const submit = async (submitForReview: boolean) => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  try {
    const result = await createShow.mutateAsync({
      submitForReview,
      payload: toCreateShowPayload(form),
    });

    notice.value = submitForReview ? "Submitted for review" : "Draft saved";

    const nextPath = submitForReview
      ? `/theaters/${slug.value}/shows/${result.id}`
      : `/theaters/${slug.value}/shows/${result.id}/edit`;

    await router.push(nextPath);
  } catch (createError: any) {
    const fetchError = createError as FetchError;
    error.value =
      fetchError?.data?.statusMessage ||
      fetchError?.data?.message ||
      fetchError?.message ||
      "Failed to create event";
  } finally {
    loading.value = false;
  }
};

const addOccurrence = () => {
  form.occurrences.push(createEmptyOccurrence());
};

const removeOccurrence = (index: number) => {
  if (form.occurrences.length === 1) {
    form.occurrences[0] = createEmptyOccurrence();
    return;
  }

  form.occurrences.splice(index, 1);
};

const addStaff = () => {
  form.staffAssignments.push(createEmptyStaffAssignment());
};

const removeStaff = (index: number) => {
  form.staffAssignments.splice(index, 1);
};
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-stage-surface-event stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-4xl">
          <span class="stage-kicker">Event proposal</span>
          <h1 class="mt-4 stage-section-title">Build the event before the theater reviews it.</h1>
          <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
            Capture the schedule, public listing essentials, and early staffing plan so theater staff can evaluate the proposal without leaving Stagecom.
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-3 xl:min-w-[28rem]">
          <div class="stage-stat bg-stage-surface-paper-strong">
            <span class="stage-overline text-stage-ink/60">Track</span>
            <span class="stage-stat-value mt-2">Show Ops</span>
          </div>
          <div class="stage-stat bg-stage-surface-paper-strong">
            <span class="stage-overline text-stage-ink/60">Default mode</span>
            <span class="stage-stat-value mt-2">Draft</span>
          </div>
          <div class="flex items-end justify-start sm:justify-end">
            <UButton variant="ghost" color="warning" :to="`/theaters/${slug}`">
              Back to theater
            </UButton>
          </div>
        </div>
      </div>
    </StageSection>

    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-stage-surface-paper stage-texture"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <ShowBuilderEditor
        mode="create"
        :form="form"
        :theater-name="meta?.theater.name"
        :busy="loading"
        :notice="notice"
        :error="error"
        :member-options="memberOptions"
        primary-action-label="Save draft"
        @add-occurrence="addOccurrence"
        @remove-occurrence="removeOccurrence"
        @add-staff="addStaff"
        @remove-staff="removeStaff"
        @save="submit(false)"
        @submit="submit(true)"
      />
    </StageSection>
  </div>
</template>
