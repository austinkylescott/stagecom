<script setup lang="ts">
import StageFeatureCard from "~/components/StageFeatureCard.vue";
import {
  showStaffAssignmentTypeOptions,
  type ShowBuilderFormState,
} from "~/utils/showBuilder";

const props = withDefaults(
  defineProps<{
    form: ShowBuilderFormState;
    theaterName?: string | null;
    mode: "create" | "edit";
    busy?: boolean;
    notice?: string;
    error?: string;
    canSubmitForReview?: boolean;
    primaryActionLabel?: string;
    memberOptions?: { label: string; value: string }[];
  }>(),
  {
    theaterName: null,
    busy: false,
    notice: "",
    error: "",
    canSubmitForReview: true,
    primaryActionLabel: "Save draft",
    memberOptions: () => [],
  },
);

const emit = defineEmits<{
  (e: "add-occurrence"): void;
  (e: "remove-occurrence", index: number): void;
  (e: "add-staff"): void;
  (e: "remove-staff", index: number): void;
  (e: "save"): void;
  (e: "submit"): void;
}>();

const steps = [
  { key: "basics", label: "Basics" },
  { key: "schedule", label: "Schedule" },
  { key: "listing", label: "Listing" },
  { key: "staffing", label: "Staffing" },
  { key: "review", label: "Review" },
] as const;

const stepCopy = {
  basics: {
    eyebrow: "Step 01",
    title: "Set the public identity.",
    description:
      "Name the event clearly, choose the format, and give theater staff the shortest possible explanation of why this belongs on the calendar.",
  },
  schedule: {
    eyebrow: "Step 02",
    title: "Lock the calendar ask.",
    description:
      "Use actual dates, not placeholders. The review queue needs concrete timing before anyone can assess fit, staffing, or conflicts.",
  },
  listing: {
    eyebrow: "Step 03",
    title: "Shape the listing package.",
    description:
      "Capture the core public details now, even if the poster and ticketing stack are still evolving.",
  },
  staffing: {
    eyebrow: "Step 04",
    title: "Show the operating plan.",
    description:
      "Early staffing and casting notes give theater leadership enough context to review the event like a real proposal, not just a title on a board.",
  },
  review: {
    eyebrow: "Step 05",
    title: "Check what the theater will see.",
    description:
      "This is the final proposal pass. Save a draft if you still have gaps, or submit when the event reads as a complete request.",
  },
} as const;

const stepIcons: Record<(typeof steps)[number]["key"], string> = {
  basics: "i-heroicons-document-text",
  schedule: "i-heroicons-calendar-days",
  listing: "i-heroicons-ticket",
  staffing: "i-heroicons-users",
  review: "i-heroicons-clipboard-document-check",
};

const activeStep = ref<(typeof steps)[number]["key"]>("basics");

const stepStatus = computed(() => ({
  basics: Boolean(props.form.title.trim() && props.form.summary.trim()),
  schedule: props.form.occurrences.some((occurrence) => occurrence.startsAt),
  listing: Boolean(props.form.description.trim()),
  staffing: true,
  review:
    Boolean(props.form.title.trim()) &&
    Boolean(props.form.summary.trim()) &&
    Boolean(props.form.description.trim()) &&
    props.form.occurrences.some((occurrence) => occurrence.startsAt),
}));

const visibleStepIndex = computed(() =>
  steps.findIndex((step) => step.key === activeStep.value),
);
const activeStepDetails = computed(() => stepCopy[activeStep.value]);
const completedStepCount = computed(
  () => Object.values(stepStatus.value).filter(Boolean).length,
);
const scheduledOccurrencesCount = computed(
  () => props.form.occurrences.filter((occurrence) => occurrence.startsAt).length,
);
const assignedStaffCount = computed(
  () => props.form.staffAssignments.filter((assignment) => assignment.userId).length,
);
const hasPoster = computed(() => Boolean(props.form.posterUrl.trim()));
const proposalHealthLabel = computed(() => {
  if (stepStatus.value.review) {
    return "Ready for review";
  }

  if (completedStepCount.value >= 3) {
    return "Nearly ready";
  }

  return "Working draft";
});
const proposalHealthTone = computed(() => {
  if (stepStatus.value.review) {
    return "bg-(--stage-theater) text-(--stage-ink)";
  }

  if (completedStepCount.value >= 3) {
    return "bg-(--stage-event) text-(--stage-ink)";
  }

  return "bg-(--stage-paper-strong) text-(--stage-ink)";
});

const goNext = () => {
  const nextStep = steps[visibleStepIndex.value + 1];
  if (nextStep) {
    activeStep.value = nextStep.key;
  }
};

const goPrev = () => {
  const prevStep = steps[visibleStepIndex.value - 1];
  if (prevStep) {
    activeStep.value = prevStep.key;
  }
};

const eventTypeItems = [
  {
    label: "Show",
    description: "A public performance or ticketed theater event.",
    value: "show",
  },
  {
    label: "Workshop",
    description: "A teaching or training event for the community.",
    value: "workshop",
  },
  {
    label: "Practice",
    description: "An internal rehearsal or team work session.",
    value: "practice",
  },
  {
    label: "Audition",
    description: "A casting call or selection event.",
    value: "audition",
  },
  {
    label: "Meeting",
    description: "An operational or community meeting.",
    value: "meeting",
  },
];

const castingModeItems = [
  { label: "Direct invite", value: "direct_invite" },
  { label: "Theater casting", value: "theater_casting" },
  { label: "Public casting", value: "public_casting" },
];
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)] 2xl:grid-cols-[310px_minmax(0,1fr)]">
    <aside class="space-y-4 xl:sticky xl:top-24 xl:self-start">
      <section class="stage-panel stage-grid-board p-5 sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="stage-overline text-stage-ink/60">Event proposal</p>
            <h2 class="mt-3 font-display text-[2rem] leading-none tracking-[0.03em] uppercase">
              Build the board-ready draft.
            </h2>
            <p class="mt-4 text-sm leading-6 stage-muted">
              {{
                theaterName
                  ? `Shape the event record for ${theaterName}.`
                  : "Capture the event record before review."
              }}
            </p>
          </div>
          <span class="stage-chip" :class="proposalHealthTone">
            {{ proposalHealthLabel }}
          </span>
        </div>

        <div class="mt-6 space-y-3">
          <button
            v-for="(step, index) in steps"
            :key="step.key"
            type="button"
            class="w-full border-3 border-(--stage-ink) px-4 py-4 text-left shadow-[5px_5px_0_0_var(--stage-ink)] transition hover:-translate-y-px"
            :class="
              activeStep === step.key
                ? 'bg-stage-surface-event'
                : 'bg-stage-surface-paper-strong hover:bg-stage-surface-paper'
            "
            @click="activeStep = step.key"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center border-2 border-(--stage-ink)"
                  :class="
                    activeStep === step.key
                      ? 'bg-(--stage-event)'
                      : 'bg-(--stage-cream)'
                  "
                >
                  <UIcon :name="stepIcons[step.key]" class="size-4 text-(--stage-ink)" />
                </div>
                <div class="min-w-0">
                  <p class="stage-overline text-stage-ink/60">
                    {{ String(index + 1).padStart(2, "0") }}
                  </p>
                  <p class="mt-1 font-display text-xl leading-none uppercase tracking-[0.03em]">
                    {{ step.label }}
                  </p>
                </div>
              </div>
              <span
                class="stage-chip shrink-0"
                :class="
                  stepStatus[step.key]
                    ? 'bg-(--stage-theater) text-(--stage-ink)'
                    : 'bg-(--stage-paper-strong) text-(--stage-ink)'
                "
              >
                {{ stepStatus[step.key] ? "Ready" : "Draft" }}
              </span>
            </div>
          </button>
        </div>
      </section>

      <section class="stage-panel-accent p-5 sm:p-6">
        <p class="stage-overline">Proposal status</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong px-4 py-3">
            <p class="stage-overline text-stage-ink/60">Completed steps</p>
            <p class="mt-2 font-display text-3xl leading-none uppercase">
              {{ completedStepCount }}/{{ steps.length }}
            </p>
          </div>
          <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong px-4 py-3">
            <p class="stage-overline text-stage-ink/60">Scheduled</p>
            <p class="mt-2 font-display text-3xl leading-none uppercase">
              {{ scheduledOccurrencesCount }}
            </p>
          </div>
          <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong px-4 py-3">
            <p class="stage-overline text-stage-ink/60">Staffed</p>
            <p class="mt-2 font-display text-3xl leading-none uppercase">
              {{ assignedStaffCount }}
            </p>
          </div>
        </div>
      </section>

      <section class="stage-panel-dark stage-grid-board overflow-hidden">
        <div class="border-b-4 border-(--stage-cream) px-5 py-4">
          <p class="stage-overline text-(--stage-paper-muted)">Draft visuals</p>
          <h3 class="mt-3 font-display text-2xl uppercase tracking-[0.04em]">
            Public preview
          </h3>
        </div>
        <div class="space-y-4 p-5 sm:p-6">
          <div
            class="relative aspect-[4/5] overflow-hidden border-3 border-(--stage-cream)"
            :class="
              hasPoster
                ? 'bg-[linear-gradient(135deg,rgba(234,165,66,0.28),rgba(130,191,182,0.22),rgba(43,41,38,0.82))]'
                : 'bg-[linear-gradient(180deg,rgba(251,247,239,0.08),rgba(43,41,38,0.96))]'
            "
          >
            <div class="absolute inset-0 bg-[linear-gradient(rgba(251,247,239,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(251,247,239,0.08)_1px,transparent_1px)] bg-[size:1.3rem_1.3rem]" />
            <div class="absolute inset-x-4 bottom-4 border-2 border-(--stage-cream) bg-[rgba(28,27,24,0.82)] p-4">
              <p class="stage-overline text-(--stage-event)">Website card</p>
              <p class="mt-2 font-display text-2xl uppercase leading-none tracking-[0.04em] text-(--stage-cream)">
                {{ form.title || "Untitled event" }}
              </p>
              <p class="mt-3 text-sm leading-6 text-[rgba(251,247,239,0.8)]">
                {{
                  form.summary ||
                  "Poster placeholder and summary preview live here until artwork is ready."
                }}
              </p>
            </div>
          </div>

          <div class="border-2 border-(--stage-cream) bg-[rgba(251,247,239,0.08)] p-4">
            <p class="stage-overline text-(--stage-paper-muted)">What staff needs</p>
            <ul class="mt-3 space-y-2 text-sm leading-6 text-[rgba(251,247,239,0.84)]">
              <li>Real schedule and event type</li>
              <li>Enough public copy to judge fit</li>
              <li>Early staffing or casting context</li>
            </ul>
          </div>
        </div>
      </section>
    </aside>

    <div class="space-y-6">
      <section class="stage-panel p-5 sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <p class="stage-overline text-stage-ink/60">
              {{ activeStepDetails.eyebrow }}
            </p>
            <h2 class="mt-3 stage-section-title max-w-3xl">
              {{ activeStepDetails.title }}
            </h2>
            <p class="mt-4 max-w-2xl text-base leading-7 stage-muted">
              {{ activeStepDetails.description }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:min-w-[18rem]">
            <div class="border-2 border-(--stage-ink) bg-stage-surface-event px-4 py-3">
              <p class="stage-overline text-stage-ink/60">Event type</p>
              <p class="mt-2 font-display text-2xl leading-none uppercase">
                {{ form.eventType || "Show" }}
              </p>
            </div>
            <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong px-4 py-3">
              <p class="stage-overline text-stage-ink/60">Submission mode</p>
              <p class="mt-2 font-display text-2xl leading-none uppercase">
                {{ mode === "create" ? "New draft" : "Editing" }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <StageFeatureCard
        v-if="activeStep === 'basics'"
        title="Event Basics"
        subtitle="Define what this is and how it should read publicly."
        tone="bg-(--stage-event)"
      >
        <div class="space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Title" required>
              <UInput v-model="form.title" placeholder="Friday Night Showcase" />
            </UFormField>
            <UFormField label="Short summary" required>
              <UInput
                v-model="form.summary"
                placeholder="Two teams, one fast midnight slot."
              />
            </UFormField>
          </div>

          <UFormField label="Event type">
            <URadioGroup v-model="form.eventType" variant="table" :items="eventTypeItems" />
          </UFormField>

          <UFormField
            label="Description"
            description="This becomes the long public description once the event is approved and published."
          >
            <UTextarea v-model="form.description" :rows="6" />
          </UFormField>

          <UFormField
            label="Internal note to theater management"
            description="Use this for programming context, requests, or anything not meant for the public listing."
          >
            <UTextarea v-model="form.producerNote" :rows="4" />
          </UFormField>
        </div>
      </StageFeatureCard>

      <StageFeatureCard
        v-else-if="activeStep === 'schedule'"
        title="Schedule And Occurrences"
        subtitle="Add the actual dates staff should evaluate."
        tone="bg-(--stage-event)"
      >
        <div class="space-y-4">
          <div
            v-for="(occurrence, index) in form.occurrences"
            :key="index"
            class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong p-4"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <p class="stage-overline text-stage-ink/60">Occurrence {{ index + 1 }}</p>
                <p class="mt-1 font-display text-xl uppercase tracking-[0.03em]">
                  Calendar slot
                </p>
              </div>
              <UButton
                v-if="form.occurrences.length > 1"
                size="xs"
                variant="ghost"
                color="error"
                @click="emit('remove-occurrence', index)"
              >
                Remove
              </UButton>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <UFormField label="Starts at" required>
                <UInput v-model="occurrence.startsAt" type="datetime-local" />
              </UFormField>
              <UFormField label="Ends at">
                <UInput v-model="occurrence.endsAt" type="datetime-local" />
              </UFormField>
            </div>
          </div>

          <UButton variant="soft" color="neutral" @click="emit('add-occurrence')">
            Add another occurrence
          </UButton>
        </div>
      </StageFeatureCard>

      <StageFeatureCard
        v-else-if="activeStep === 'listing'"
        title="Public Listing Essentials"
        subtitle="Capture the fields that make this event publishable later."
        tone="bg-(--stage-event)"
      >
        <div class="space-y-5">
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Poster URL" description="Optional for now. Placeholder art will be used if empty.">
              <UInput
                v-model="form.posterUrl"
                placeholder="https://images.example.com/show-poster.jpg"
              />
            </UFormField>
            <UFormField label="Ticket URL">
              <UInput
                v-model="form.ticketUrl"
                placeholder="https://tickets.example.com"
              />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="On sale at">
              <UInput v-model="form.onSaleAt" type="datetime-local" />
            </UFormField>
            <UFormField label="Casting mode">
              <USelect v-model="form.castingMode" :items="castingModeItems" />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="Cast minimum">
              <UInput v-model.number="form.castMin" type="number" min="0" />
            </UFormField>
            <UFormField label="Cast maximum">
              <UInput v-model.number="form.castMax" type="number" min="0" />
            </UFormField>
          </div>
        </div>
      </StageFeatureCard>

      <StageFeatureCard
        v-else-if="activeStep === 'staffing'"
        title="Casting And Staffing"
        subtitle="Capture early operations details even if the full team is not locked yet."
        tone="bg-(--stage-performer)"
      >
        <div class="space-y-4">
          <div
            v-for="(assignment, index) in form.staffAssignments"
            :key="index"
            class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong p-4"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <p class="stage-overline text-stage-ink/60">
                  Staff assignment {{ index + 1 }}
                </p>
                <p class="mt-1 font-display text-xl uppercase tracking-[0.03em]">
                  Coverage slot
                </p>
              </div>
              <UButton
                size="xs"
                variant="ghost"
                color="error"
                @click="emit('remove-staff', index)"
              >
                Remove
              </UButton>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <UFormField label="Member">
                <USelectMenu
                  v-model="assignment.userId"
                  :items="memberOptions"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Assignment type">
                <USelect
                  v-model="assignment.assignmentType"
                  :items="showStaffAssignmentTypeOptions"
                />
              </UFormField>
            </div>

            <UFormField label="Notes" class="mt-4">
              <UTextarea v-model="assignment.note" :rows="3" />
            </UFormField>
          </div>

          <UButton variant="soft" color="neutral" @click="emit('add-staff')">
            Add staff assignment
          </UButton>
        </div>
      </StageFeatureCard>

      <StageFeatureCard
        v-else
        title="Review"
        subtitle="Check the public-facing essentials before you save or submit."
        tone="bg-(--stage-theater)"
      >
        <div class="space-y-4">
          <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong p-4">
            <p class="stage-overline">Title</p>
            <p class="mt-2 text-lg font-semibold">{{ form.title || "Untitled event" }}</p>
            <p class="mt-3 text-sm stage-muted">
              {{ form.summary || "Add a short summary before sending this to review." }}
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong p-4">
              <p class="stage-overline">Occurrences</p>
              <p class="mt-2 text-sm stage-muted">
                {{ form.occurrences.filter((occurrence) => occurrence.startsAt).length }}
                scheduled occurrence{{ form.occurrences.filter((occurrence) => occurrence.startsAt).length === 1 ? "" : "s" }}
              </p>
            </div>
            <div class="border-2 border-(--stage-ink) bg-stage-surface-paper-strong p-4">
              <p class="stage-overline">Staff assignments</p>
              <p class="mt-2 text-sm stage-muted">
                {{ form.staffAssignments.filter((assignment) => assignment.userId).length }}
                assignment{{ form.staffAssignments.filter((assignment) => assignment.userId).length === 1 ? "" : "s" }}
              </p>
            </div>
          </div>

          <div class="border-2 border-dashed border-(--stage-ink) bg-stage-surface-event p-4 text-sm stage-muted">
            Stagecom will use this draft as the operational source of truth. Approval and public publication are separate decisions.
          </div>
        </div>
      </StageFeatureCard>

      <div class="stage-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div class="flex items-center gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="visibleStepIndex <= 0"
            @click="goPrev"
          >
            Back
          </UButton>
          <UButton
            variant="soft"
            color="neutral"
            :disabled="visibleStepIndex >= steps.length - 1"
            @click="goNext"
          >
            Next
          </UButton>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton :loading="busy" color="neutral" variant="soft" @click="emit('save')">
            {{ primaryActionLabel }}
          </UButton>
          <UButton
            v-if="canSubmitForReview"
            :loading="busy"
            color="warning"
            @click="emit('submit')"
          >
            Submit for review
          </UButton>
        </div>
      </div>

      <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>
