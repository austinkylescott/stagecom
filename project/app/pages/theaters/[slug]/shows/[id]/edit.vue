<script setup lang="ts">
import { useRequestHeaders } from "#app";
import ShowBuilderEditor from "~/components/ShowBuilderEditor.vue";
import {
  useShowDetail,
  useUpdateShowDraft,
  useUpdateShowStatus,
  type ShowDetailResponse,
} from "~/composables/useShowDetail";
import type { PerformersResponse } from "~/queries/people";
import {
  createEmptyOccurrence,
  createEmptyShowBuilderForm,
  createEmptyStaffAssignment,
  populateShowBuilderForm,
  toCreateShowPayload,
} from "~/utils/showBuilder";

const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);
const id = computed(() => route.params.id as string);

const { data: initialData } = await useAsyncData(
  () =>
    $fetch<ShowDetailResponse>(`/api/shows/${id.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, refresh } = useShowDetail(id, initialData);

const theaterId = computed(() => data.value?.show.theaterId);

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
const hydratedFromDetail = ref(false);
const loading = ref(false);
const notice = ref("");
const error = ref("");

watch(
  data,
  (detail) => {
    if (!detail || hydratedFromDetail.value) return;
    populateShowBuilderForm(form, detail);
    hydratedFromDetail.value = true;
  },
  { immediate: true },
);

const updateDraft = useUpdateShowDraft(id, computed(() => slug.value));
const updateStatus = useUpdateShowStatus(id, computed(() => slug.value));

const memberOptions = computed(() =>
  (initialMembers.value?.profiles ?? []).map((profile) => ({
    label: profile.display_name || "Unnamed member",
    value: profile.id,
  })),
);

const saveDraft = async () => {
  loading.value = true;
  notice.value = "";
  error.value = "";

  try {
    await updateDraft.mutateAsync(toCreateShowPayload(form));
    notice.value = "Draft updated";
    await refresh();
  } catch (updateError: any) {
    error.value =
      updateError?.data?.statusMessage ||
      updateError?.data?.message ||
      updateError?.message ||
      "Failed to update event";
  } finally {
    loading.value = false;
  }
};

const submitForReview = async () => {
  loading.value = true;
  notice.value = "";
  error.value = "";

  try {
    await updateDraft.mutateAsync(toCreateShowPayload(form));
    await updateStatus.mutateAsync({ action: "submit_for_review" });
    await router.push(`/theaters/${slug.value}/shows/${id.value}`);
  } catch (submitError: any) {
    error.value =
      submitError?.data?.statusMessage ||
      submitError?.data?.message ||
      submitError?.message ||
      "Failed to submit event";
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
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="stage-kicker">Draft editor</span>
          <h1 class="mt-4 stage-section-title">Refine the event before it goes to review.</h1>
          <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
            Keep shaping the event record, then submit it when the listing and schedule are ready for theater staff.
          </p>
        </div>
        <UButton variant="ghost" :to="`/theaters/${slug}/shows/${id}`">
          Back to event
        </UButton>
      </div>
    </StageSection>

    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.54)]"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <ShowBuilderEditor
        mode="edit"
        :form="form"
        :theater-name="data?.show.theaterName"
        :busy="loading"
        :notice="notice"
        :error="error"
        :member-options="memberOptions"
        :can-submit-for-review="['draft', 'rejected'].includes(data?.show.status || '')"
        primary-action-label="Save changes"
        @add-occurrence="addOccurrence"
        @remove-occurrence="removeOccurrence"
        @add-staff="addStaff"
        @remove-staff="removeStaff"
        @save="saveDraft"
        @submit="submitForReview"
      />
    </StageSection>
  </div>
</template>
