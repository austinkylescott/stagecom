<script setup lang="ts">
const showModal = ref(false);
const showDrawer = ref(false);
const sampleInput = ref("");
const sampleSelect = ref("");
const sampleTextarea = ref("");

const eventTypeOptions = [
  { label: "Improv Show", value: "improv_show" },
  { label: "Workshop", value: "workshop" },
  { label: "Audition", value: "audition" },
  { label: "Practice", value: "practice" },
  { label: "Meeting", value: "meeting" },
];

const colors = [
  { label: "Ink", var: "--stage-ink", hex: "#2B2926" },
  { label: "Paper", var: "--stage-paper", hex: "#F5EFE2" },
  { label: "Cream", var: "--stage-cream", hex: "#FBF7EF" },
  { label: "Theater / Mint", var: "--stage-theater", hex: "#82BFB6" },
  { label: "Event / Amber", var: "--stage-event", hex: "#EAA542" },
  { label: "Performer / Coral", var: "--stage-performer", hex: "#C76056" },
];

const surfaceColors = [
  { label: "Paper Strong", var: "--stage-paper-strong", hex: "#EFE3CD" },
  { label: "Paper Muted", var: "--stage-paper-muted", hex: "#D8CCB5" },
  { label: "Theater Soft", var: "--stage-theater-soft", hex: "#CFE7E3" },
  { label: "Event Soft", var: "--stage-event-soft", hex: "#F4D7AA" },
  { label: "Performer Soft", var: "--stage-performer-soft", hex: "#E8B3AC" },
];

type ButtonColor = "primary" | "warning" | "error" | "neutral";
type ButtonVariant = "solid" | "soft" | "ghost" | "outline" | "subtle" | "link";

const buttonVariants: ButtonVariant[] = [
  "solid",
  "soft",
  "ghost",
  "outline",
  "subtle",
  "link",
];
const buttonSemantics: { label: string; color: ButtonColor }[] = [
  { label: "Theater", color: "primary" },
  { label: "Event", color: "warning" },
  { label: "Performer", color: "error" },
  { label: "Neutral", color: "neutral" },
];

const tones = ["theater", "event", "performer", "neutral"] as const;
</script>

<template>
  <div class="min-h-screen bg-(--stage-cream)">
    <!-- Header -->
    <header
      class="border-b-3 border-(--stage-ink) bg-(--stage-cream) px-6 py-6 sm:px-10"
    >
      <p class="stage-overline">Dev Reference</p>
      <h1
        class="mt-2 font-display text-5xl uppercase tracking-[0.02em] text-(--stage-ink) sm:text-6xl"
      >
        Component Library
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
        Living reference for Stagecom's Nuxt UI theme. Every component here
        renders through the same <code>app.config.ts</code> theme and
        <code>main.css</code> tokens used in the production app.
      </p>
    </header>

    <main class="mx-auto max-w-7xl space-y-16 px-6 py-12 sm:px-10">
      <!-- ============================================ -->
      <!-- 01 BRAND COLORS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="01"
          title="Brand Colors"
          description="Fixed semantic palette. Theater = mint, event = amber, performer = coral."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
          <div v-for="c in colors" :key="c.var" class="space-y-2">
            <div
              class="size-16 border-2 border-(--stage-ink)"
              :style="{ background: `var(${c.var})` }"
            />
            <p class="text-xs font-bold uppercase tracking-wider">
              {{ c.label }}
            </p>
            <p class="font-mono text-[10px] stage-muted">{{ c.hex }}</p>
          </div>
        </div>

        <p class="stage-overline mt-8">Surface Tints</p>
        <div class="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-5">
          <div v-for="c in surfaceColors" :key="c.var" class="space-y-2">
            <div
              class="size-12 border-2 border-(--stage-ink)"
              :style="{ background: `var(${c.var})` }"
            />
            <p class="text-[10px] font-bold uppercase tracking-wider">
              {{ c.label }}
            </p>
            <p class="font-mono text-[10px] stage-muted">{{ c.hex }}</p>
          </div>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 02 TYPOGRAPHY -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="02"
          title="Typography"
          description="Cubano for display. Public Sans for operational text. Uppercase for structure, sentence case for content."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 space-y-8">
          <div
            class="border-3 border-(--stage-ink) bg-stage-surface-paper-strong p-6"
          >
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] stage-muted">
              Display / Cubano
            </p>
            <p class="stage-title mt-2">Friday Night Frenzy</p>
          </div>

          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] stage-muted">
              Section Title / Cubano
            </p>
            <p class="stage-section-title mt-2">Upcoming Shows</p>
          </div>

          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] stage-muted">
              Overline / Public Sans
            </p>
            <p class="stage-overline mt-2">Theater Dashboard</p>
          </div>

          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.12em] stage-muted">
              Body / Public Sans
            </p>
            <p class="mt-2 max-w-xl text-sm leading-7 text-(--stage-ink)">
              Stagecom is a community management platform for improv theaters
              that centralizes performer rosters, show scheduling, lineup
              building, and theater-level oversight into one purpose-built tool.
            </p>
          </div>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 03 BUTTONS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="03"
          title="Staged Actions"
          description="UButton themed through app.config.ts. Semantic colors map to theater, event, performer, and neutral roles."
        />
        <div class="stage-rule mt-4" />

        <!-- Button variant matrix -->
        <div class="mt-8 space-y-6">
          <div v-for="sem in buttonSemantics" :key="sem.color">
            <p class="stage-overline mb-3">{{ sem.label }}</p>
            <div class="flex flex-wrap items-center gap-3">
              <UButton
                v-for="v in buttonVariants"
                :key="v"
                :color="sem.color"
                :variant="v"
              >
                {{ v }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- StageButton tones -->
        <p class="stage-overline mb-3 mt-10">StageButton Tones</p>
        <div class="flex flex-wrap items-center gap-3">
          <StageButton
            v-for="t in tones"
            :key="t"
            :tone="t"
            variant="ghost"
          >
            {{ t }}
          </StageButton>
          <StageButton
            v-for="t in tones"
            :key="`${t}-active`"
            :tone="t"
            :active="true"
            variant="ghost"
          >
            {{ t }} (active)
          </StageButton>
        </div>

        <!-- Real-world button examples -->
        <p class="stage-overline mb-3 mt-10">Feature Actions</p>
        <div class="flex flex-wrap items-center gap-3">
          <UButton color="primary">Submit Show</UButton>
          <UButton color="primary" variant="outline">Join Theater</UButton>
          <UButton color="warning">View Schedule</UButton>
          <UButton color="error">Approve Cast</UButton>
          <UButton color="neutral">Review Submission</UButton>
          <UButton color="neutral" variant="link">View All Shows</UButton>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 04 BADGES & TAGS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="04"
          title="Operational Tags"
          description="UBadge with semantic soft variants for show lifecycle and membership states."
        />
        <div class="stage-rule mt-4" />

        <p class="stage-overline mb-3 mt-8">Show Lifecycle</p>
        <div class="flex flex-wrap items-center gap-3">
          <UBadge color="neutral" variant="soft">Draft</UBadge>
          <UBadge color="warning" variant="soft">Pending Review</UBadge>
          <UBadge color="primary" variant="soft">Approved</UBadge>
          <UBadge color="primary" variant="soft">Published</UBadge>
          <UBadge color="error" variant="soft">Rejected</UBadge>
        </div>

        <p class="stage-overline mb-3 mt-8">Cast Status</p>
        <div class="flex flex-wrap items-center gap-3">
          <UBadge color="warning" variant="soft">Invited</UBadge>
          <UBadge color="primary" variant="soft">Accepted</UBadge>
          <UBadge color="error" variant="soft">Declined</UBadge>
          <UBadge color="neutral" variant="soft">Removed</UBadge>
        </div>

        <p class="stage-overline mb-3 mt-8">Theater Roles</p>
        <div class="flex flex-wrap items-center gap-3">
          <UBadge color="primary" variant="soft">Manager</UBadge>
          <UBadge color="primary" variant="soft">Staff</UBadge>
          <UBadge color="primary" variant="soft">Member</UBadge>
          <UBadge color="warning" variant="soft">Producer</UBadge>
          <UBadge color="error" variant="soft">Performer</UBadge>
        </div>

        <p class="stage-overline mb-3 mt-8">Event Types</p>
        <div class="flex flex-wrap items-center gap-3">
          <UBadge color="warning" variant="soft">Improv Show</UBadge>
          <UBadge color="warning" variant="soft">Workshop</UBadge>
          <UBadge color="warning" variant="soft">Audition</UBadge>
          <UBadge color="warning" variant="soft">Practice</UBadge>
          <UBadge color="neutral" variant="soft">Meeting</UBadge>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 05 DATA ENTRY -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="05"
          title="Data Entry"
          description="UInput, USelect, UTextarea wrapped with UFormField. Labels auto-styled via formField theme."
        />
        <div class="stage-rule mt-4" />

        <div
          class="mt-8 grid gap-6 border-3 border-(--stage-ink) bg-stage-surface-paper-strong p-6 shadow-(--stage-shadow-sm) sm:grid-cols-2"
        >
          <UFormField label="Show Name">
            <UInput
              v-model="sampleInput"
              placeholder="e.g. Friday Night Frenzy"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Event Type">
            <USelect
              v-model="sampleSelect"
              :items="eventTypeOptions"
              placeholder="Select type..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Producer" hint="Optional">
            <UInput placeholder="Search members..." class="w-full" />
          </UFormField>

          <UFormField label="Casting Mode">
            <USelect
              :items="[
                { label: 'Invite Only', value: 'invite' },
                { label: 'Theater Casting', value: 'theater' },
                { label: 'Public Casting', value: 'public' },
              ]"
              placeholder="Select mode..."
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description" class="sm:col-span-2">
            <UTextarea
              v-model="sampleTextarea"
              placeholder="Brief description for the public listing..."
              class="w-full"
              :rows="3"
            />
          </UFormField>

          <UFormField
            label="Show Name"
            error="Show name is required"
            class="sm:col-span-2"
          >
            <UInput placeholder="Error state example" class="w-full" />
          </UFormField>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 06 CARDS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="06"
          title="Cards"
          description="UCard with ink frame and hard offset shadow. Used for theater summaries, show details, and dashboard modules."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 grid gap-6 sm:grid-cols-2">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <p class="stage-overline">Theater</p>
                  <p
                    class="mt-1 font-display text-2xl uppercase tracking-[0.04em]"
                  >
                    The Laughing Llama
                  </p>
                </div>
                <UBadge color="primary" variant="soft">42 Members</UBadge>
              </div>
            </template>
            <div class="space-y-2">
              <p class="text-sm stage-muted">Chicago, IL</p>
              <p class="text-sm text-(--stage-ink)">
                A long-running improv theater known for high-energy Friday night
                shows and a strong workshop program.
              </p>
            </div>
            <template #footer>
              <div class="flex items-center gap-3">
                <UButton size="sm" color="primary">View Theater</UButton>
                <UButton size="sm" color="primary" variant="outline">
                  View Schedule
                </UButton>
              </div>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <p class="stage-overline">Show</p>
                  <p
                    class="mt-1 font-display text-2xl uppercase tracking-[0.04em]"
                  >
                    Friday Night Frenzy
                  </p>
                </div>
                <UBadge color="warning" variant="soft">Published</UBadge>
              </div>
            </template>
            <div class="space-y-2">
              <p class="text-sm stage-muted">Fri Apr 11 &middot; 8:00 PM</p>
              <p class="text-sm text-(--stage-ink)">
                High-energy improv featuring the house team and special guests.
                Doors open at 7:30.
              </p>
            </div>
            <template #footer>
              <div class="flex items-center gap-3">
                <UButton size="sm" color="warning">View Show</UButton>
                <UBadge color="error" variant="soft">6 Cast</UBadge>
              </div>
            </template>
          </UCard>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 07 ALERTS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="07"
          title="Alerts"
          description="UAlert with ink border and hard shadow. Used for status messages and action prompts."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 space-y-4">
          <UAlert
            title="Show Submitted"
            description="'Friday Night Frenzy' has been sent to the theater for review. You'll be notified when it's approved."
          />
          <UAlert
            title="Cast Finalized"
            description="All 6 performers have accepted their invitations. The lineup is locked."
          />
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 08 SECTION HEADERS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="08"
          title="Section Headers"
          description="StageSectionHeader primitive. Overline + display title + optional description and action slot."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 space-y-8">
          <StageSectionHeader
            overline="Theater Dashboard"
            title="The Laughing Llama"
            description="Overview of your theater's shows, members, and upcoming events."
          >
            <template #actions>
              <UButton size="sm" color="primary" variant="outline">
                Theater Settings
              </UButton>
            </template>
          </StageSectionHeader>

          <div class="stage-rule" />

          <StageSectionHeader
            overline="Your Shows"
            title="Schedule"
            description="All shows you're producing or performing in."
          >
            <template #actions>
              <UButton size="sm" color="warning">New Show</UButton>
            </template>
          </StageSectionHeader>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 09 TOOLTIPS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="09"
          title="Tooltips"
          description="UTooltip with ink background and sharp corners."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <UTooltip text="View theater details">
            <UButton color="primary" variant="outline">
              Hover for tooltip
            </UButton>
          </UTooltip>
          <UTooltip text="You're a member of this theater">
            <UBadge color="primary" variant="soft">Member</UBadge>
          </UTooltip>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 10 MODAL & DRAWER -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="10"
          title="Modal & Drawer"
          description="UModal and UDrawer with ink overlay and brutalist frame."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <UButton color="neutral" @click="showModal = true">
            Open Modal
          </UButton>
          <UButton color="neutral" variant="outline" @click="showDrawer = true">
            Open Drawer
          </UButton>
        </div>

        <UModal
          :open="showModal"
          @update:open="(val) => (showModal = val)"
        >
          <template #content>
            <UCard>
              <template #header>
                <p class="font-display text-xl uppercase tracking-[0.06em]">
                  Confirm Action
                </p>
              </template>
              <p class="text-sm text-(--stage-ink)">
                Are you sure you want to submit "Friday Night Frenzy" for
                review? The theater management team will be notified.
              </p>
              <template #footer>
                <div class="flex justify-end gap-2">
                  <UButton variant="ghost" @click="showModal = false">
                    Cancel
                  </UButton>
                  <UButton color="primary" @click="showModal = false">
                    Submit for Review
                  </UButton>
                </div>
              </template>
            </UCard>
          </template>
        </UModal>

        <UDrawer
          v-model:open="showDrawer"
          direction="bottom"
          :handle="true"
        >
          <template #content>
            <div class="mx-auto w-full max-w-2xl px-6 py-6">
              <p class="stage-overline">Quick Actions</p>
              <h2
                class="mt-2 font-display text-3xl uppercase tracking-[0.06em] text-(--stage-ink)"
              >
                Show Options
              </h2>
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <UButton block color="primary" @click="showDrawer = false">
                  Edit Show Details
                </UButton>
                <UButton block color="warning" @click="showDrawer = false">
                  Manage Cast
                </UButton>
                <UButton
                  block
                  color="neutral"
                  variant="outline"
                  @click="showDrawer = false"
                >
                  View Schedule
                </UButton>
                <UButton
                  block
                  color="error"
                  variant="outline"
                  @click="showDrawer = false"
                >
                  Cancel Show
                </UButton>
              </div>
            </div>
          </template>
        </UDrawer>
      </section>

      <!-- ============================================ -->
      <!-- 11 SURFACE CLASSES -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="11"
          title="Surface Primitives"
          description="Shared CSS classes from main.css for framing, panels, chips, and layout."
        />
        <div class="stage-rule mt-4" />

        <div class="mt-8 grid gap-6 sm:grid-cols-2">
          <div class="stage-frame p-6">
            <p class="stage-overline">stage-frame</p>
            <p class="mt-2 text-sm stage-muted">
              Primary ink-bordered container with hard offset shadow.
            </p>
          </div>

          <div class="stage-panel p-6">
            <p class="stage-overline">stage-panel</p>
            <p class="mt-2 text-sm stage-muted">
              Opaque cream panel with ink border.
            </p>
          </div>

          <div class="stage-panel-dark p-6">
            <p class="stage-overline text-(--stage-cream)">stage-panel-dark</p>
            <p class="mt-2 text-sm text-(--stage-cream)/70">
              Dark ink panel for contrast sections.
            </p>
          </div>

          <div class="stage-list-card p-6">
            <p class="stage-overline">stage-list-card</p>
            <p class="mt-2 text-sm stage-muted">
              Lighter shadow for list items and compact cards.
            </p>
          </div>

          <div class="stage-stat">
            <p class="stage-stat-value">42</p>
            <p class="mt-1 text-xs font-bold uppercase tracking-wider stage-muted">
              Members
            </p>
          </div>

          <div class="stage-stat">
            <p class="stage-stat-value">12</p>
            <p class="mt-1 text-xs font-bold uppercase tracking-wider stage-muted">
              Shows
            </p>
          </div>
        </div>

        <p class="stage-overline mb-3 mt-10">Chips</p>
        <div class="flex flex-wrap items-center gap-3">
          <span class="stage-chip">Default Chip</span>
          <span class="stage-chip stage-chip-dark">Dark Chip</span>
          <span class="stage-kicker">Theater Update</span>
        </div>
      </section>

      <!-- ============================================ -->
      <!-- 12 LAYOUT PATTERNS -->
      <!-- ============================================ -->
      <section>
        <StageSectionHeader
          overline="12"
          title="Layout Patterns"
          description="Production list pattern showing shows with status, date, and navigation."
        />
        <div class="stage-rule mt-4" />

        <div
          class="mt-8 border-3 border-(--stage-ink) bg-stage-surface-paper-strong shadow-(--stage-shadow)"
        >
          <div
            class="flex items-center justify-between border-b-3 border-(--stage-ink) px-5 py-3"
          >
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-(--stage-ink)">
              Upcoming Shows
            </p>
            <UButton size="xs" color="neutral" variant="link">
              View All Shows
            </UButton>
          </div>

          <div
            class="flex items-center justify-between border-b border-(--stage-ink)/10 px-5 py-4"
          >
            <div>
              <p class="text-sm font-semibold text-(--stage-ink)">
                Friday Night Frenzy
              </p>
              <p class="mt-0.5 text-xs stage-muted">
                Fri Apr 11 &middot; 8:00 PM
              </p>
            </div>
            <UBadge color="primary" variant="soft">Published</UBadge>
          </div>

          <div
            class="flex items-center justify-between border-b border-(--stage-ink)/10 px-5 py-4"
          >
            <div>
              <p class="text-sm font-semibold text-(--stage-ink)">
                Improv 101 Workshop
              </p>
              <p class="mt-0.5 text-xs stage-muted">
                Sat Apr 12 &middot; 2:00 PM
              </p>
            </div>
            <UBadge color="warning" variant="soft">Approved</UBadge>
          </div>

          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-sm font-semibold text-(--stage-ink)">
                Cast Jam Session
              </p>
              <p class="mt-0.5 text-xs stage-muted">
                Sun Apr 13 &middot; 6:00 PM
              </p>
            </div>
            <UBadge color="neutral" variant="soft">Draft</UBadge>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <div class="stage-rule" />
      <p class="pb-8 text-center text-xs stage-muted">
        Stagecom Component Library &middot; Dev Reference
      </p>
    </main>
  </div>
</template>
