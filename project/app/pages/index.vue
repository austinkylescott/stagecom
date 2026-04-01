<script setup lang="ts">
import StageFeatureCard from "~/components/StageFeatureCard.vue";
import StageStackedBoard from "~/components/StageStackedBoard.vue";

const activeRole = ref<"managers" | "producers" | "performers">("producers");

const workflowSources = [
  "Spreadsheets",
  "Email threads",
  "Group texts",
  "Discord",
  "Social media",
  "Stagecom",
];

const heroPreviewShows = [
  {
    cast: 4,
    title: "Friday Night Showcase",
    time: "8:00 PM",
    status: "Confirmed",
    tone: "bg-(--stage-event)",
  },
  {
    cast: 6,
    title: "Late Night Jam",
    time: "10:30 PM",
    status: "Casting",
    tone: "bg-(--stage-performer)",
  },
  {
    cast: 12,
    title: "Weekend Workshop",
    time: "2:00 PM Sat",
    status: "Pending",
    tone: "bg-(--stage-paper-strong)",
  },
];

const problems = [
  {
    tool: "Spreadsheets",
    title: "Lineup changes get lost in version chaos",
    detail: "Who updated it last? Is this the right one?",
  },
  {
    tool: "Email threads",
    title: "Critical show info buried in reply-alls",
    detail: "Scroll through 47 messages to find the call time",
  },
  {
    tool: "Group texts",
    title: "Performers miss key updates in the noise",
    detail: "Important details lost between memes",
  },
  {
    tool: "Discord servers",
    title: "Producers repeat themselves across channels",
    detail: "Did I post this in #shows or #announcements?",
  },
  {
    tool: "Social media DMs",
    title: "Casting happens through personal contacts",
    detail: "Hope they check their messages this time",
  },
  {
    tool: "No single source",
    title: "Theater managers have zero visibility",
    detail: "What shows are even happening this month?",
  },
];

const features = [
  {
    title: "Theater Membership",
    description: "Organize your community with clear roles and relationships",
    tone: "bg-(--stage-mint)",
    span: "sm:col-span-2 lg:col-span-2",
  },
  {
    title: "Show & Event Creation",
    description:
      "Schedule shows, practices, workshops, meetings, and auditions",
    tone: "bg-(--stage-gold)",
    span: "sm:col-span-2 lg:col-span-2",
  },
  {
    title: "Explicit Cast Management",
    description: "People are only in a lineup when they are actually added",
    tone: "bg-(--stage-coral)",
    span: "lg:col-span-1",
  },
  {
    title: "Invitations & Responses",
    description: "Clear accept/decline flows with automatic tracking",
    tone: "bg-(--stage-coral)",
    span: "lg:col-span-1",
  },
  {
    title: "Lineup & Rundown",
    description: "Program order that everyone can see and trust",
    tone: "bg-(--stage-coral)",
    span: "lg:col-span-1",
  },
  {
    title: "Review & Approval",
    description: "Theater oversight without micromanagement",
    tone: "bg-(--stage-mint)",
    span: "lg:col-span-1",
  },
  {
    title: "Notifications",
    description: "In-app and email updates that actually matter",
    tone: "bg-(--stage-mint)",
    span: "lg:col-span-1",
  },
  {
    title: "Profiles",
    description: "Community participation and visibility for performers",
    tone: "bg-(--stage-coral)",
    span: "lg:col-span-1",
  },
  {
    title: "Casting Visibility",
    description:
      "Control who sees what with invite-only, theater, or public modes",
    tone: "bg-(--stage-coral)",
    span: "lg:col-span-1",
  },
  {
    title: "Contextual Roles",
    description: "Be a producer for one show and a performer in another",
    tone: "bg-(--stage-coral)",
    span: "lg:col-span-1",
  },
];

const roles = {
  managers: {
    label: "Theater Managers",
    subtitle: "Oversight without micromanagement",
    tone: "bg-(--stage-mint)",
    benefits: [
      "See all upcoming shows and events at a glance",
      "Approve shows before they go public",
      "Assign staff and delegate responsibilities",
      "Maintain theater-level permissions and trust",
      "Track what's happening without chasing updates",
    ],
    quote:
      "Finally, I can see what's actually happening at my theater without asking five people.",
  },
  producers: {
    label: "Producers",
    subtitle: "Operational clarity, not chaos",
    tone: "bg-(--stage-gold)",
    benefits: [
      "Create shows with clear ownership",
      "Build lineups with explicit cast management",
      "Send invitations and track responses",
      "Communicate show-day updates in one place",
      "Manage changes without endless follow-up",
    ],
    quote:
      "I used to spend hours coordinating across text, email, and DMs. Now it's all in one place.",
  },
  performers: {
    label: "Performers",
    subtitle: "Know when and where you perform",
    tone: "bg-(--stage-coral)",
    benefits: [
      "See your upcoming shows and practices",
      "Accept or decline invitations clearly",
      "Find casting opportunities in your community",
      "Get show-day info when you need it",
      "Stay connected to your local scene",
    ],
    quote:
      "I actually know what shows I'm in now. No more guessing or asking around.",
  },
} as const;

const activeRoleData = computed(() => roles[activeRole.value]);

const showcaseCards = [
  {
    title: "Show Setup",
    subtitle: "Clear ownership and casting controls",
    tone: "bg-(--stage-gold)",
    kind: "setup",
  },
  {
    title: "Cast Invitations",
    subtitle: "Track responses in real-time",
    tone: "bg-(--stage-coral)",
    kind: "invites",
  },
  {
    title: "Lineup Order",
    subtitle: "Program everyone can trust",
    tone: "bg-(--stage-coral)",
    kind: "lineup",
  },
  {
    title: "Review Queue",
    subtitle: "Theater approval workflow",
    tone: "bg-(--stage-mint)",
    kind: "review",
  },
] as const;

const principles = [
  {
    title: "Privacy by Default",
    description:
      "Not everything should be public. Internal coordination happens safely within your theater.",
  },
  {
    title: "Contextual Roles",
    description:
      "Be a producer for one show and a performer in another. Roles match reality, not rigid hierarchies.",
  },
  {
    title: "Explicit Cast Membership",
    description:
      "People are only in a lineup when they are actually added. No ambiguity, no assumptions.",
  },
  {
    title: "Theater Oversight",
    description:
      "Managers can see what's happening and approve shows without micromanaging every detail.",
  },
  {
    title: "Reduced Off-Platform Chaos",
    description:
      "Fewer side conversations, fewer missed updates, fewer unclear lineups. Everything in one place.",
  },
  {
    title: "Community-Centered",
    description:
      "Built for theaters, producers, and performers. Everyone in your community has a reason to be here.",
  },
];

const inviteRows = [
  {
    name: "Jordan Lee",
    status: "Accepted",
    tone: "bg-(--stage-performer-soft)",
  },
  { name: "Sam Chen", status: "Accepted", tone: "bg-(--stage-performer-soft)" },
  {
    name: "Taylor Wright",
    status: "Pending",
    tone: "bg-(--stage-paper-strong)",
  },
  { name: "Casey Morgan", status: "Declined", tone: "bg-(--stage-coral)" },
  { name: "Riley Park", status: "Pending", tone: "bg-(--stage-paper-strong)" },
];

const lineupRows = [
  { order: 1, title: "Opening Harold", team: "Team A", time: "8:00" },
  { order: 2, title: "Musical Improv", team: "The Singers", time: "8:25" },
  { order: 3, title: "Scene Night", team: "Veterans", time: "8:50" },
  { order: 4, title: "Closing Set", team: "House Team", time: "9:15" },
];

const reviewRows = [
  { title: "Saturday Night Special", author: "Pat Davis", pending: true },
  { title: "Workshop: Scene Work 101", author: "Alex Rivera", pending: false },
  { title: "Late Night Jam", author: "Jordan Lee", pending: true },
];

const notifications = [
  {
    text: "Jordan accepted your invite",
    tone: "border-(--stage-performer) bg-[rgba(191,77,70,0.12)]",
  },
  {
    text: "New show needs approval",
    tone: "border-(--stage-theater) bg-[rgba(94,144,217,0.12)]",
  },
  {
    text: "Reminder: Show in 2 hours",
    tone: "border-(--stage-event) bg-[rgba(231,180,55,0.12)]",
  },
];
</script>

<template>
  <div class="space-y-0">
    <section
      class="relative overflow-hidden border-b-14 border-(--stage-ink) bg-(--stage-cream)"
    >
      <div class="absolute inset-0 opacity-[0.07] stage-grid-board" />

      <div
        class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
      >
        <div
          class="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr] lg:gap-16"
        >
          <div class="space-y-8">
            <div
              class="inline-flex w-fit items-center gap-3 border-3 border-(--stage-ink) bg-(--stage-paper-strong) px-4 py-2"
            >
              <span class="relative flex size-2.5">
                <span
                  class="absolute inline-flex size-full animate-ping bg-(--stage-theater) opacity-75"
                />
                <span
                  class="relative inline-flex size-2.5 bg-(--stage-theater)"
                />
              </span>
              <span class="text-sm font-semibold text-(--stage-ink)">
                Building with the community
              </span>
            </div>

            <div class="space-y-4">
              <h1
                class="stage-title max-w-4xl text-[clamp(3.3rem,6vw,6.4rem)] leading-[1.02]"
              >
                A home for your improv community
              </h1>
              <p class="max-w-2xl text-lg leading-8 stage-muted sm:text-xl">
                The backstage system for your local scene. Run your theater
                together, not across six different tools.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="source in workflowSources"
                :key="source"
                class="border-2 px-3 py-1 text-sm font-medium"
                :class="
                  source === 'Stagecom'
                    ? 'border-(--stage-ink) bg-(--stage-theater) text-(--stage-ink)'
                    : 'border-[rgba(43,41,38,0.28)] text-[rgba(43,41,38,0.58)] line-through decoration-(--stage-coral) decoration-2'
                "
              >
                {{ source }}
              </span>
            </div>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <UButton
                to="/signup"
                size="lg"
                icon="i-heroicons-arrow-right"
                trailing
              >
                Join the waitlist
              </UButton>
              <UButton to="#features" size="lg" variant="ghost">
                Explore features
              </UButton>
            </div>

            <div class="flex flex-wrap gap-6 pt-2">
              <div class="flex items-center gap-2">
                <span
                  class="size-5 border-2 border-(--stage-ink) bg-(--stage-theater)"
                />
                <span class="text-sm font-semibold text-(--stage-ink)"
                  >For theaters</span
                >
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="size-5 border-2 border-(--stage-ink) bg-(--stage-coral)"
                />
                <span class="text-sm font-semibold text-(--stage-ink)"
                  >For performers</span
                >
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="size-5 border-2 border-(--stage-ink) bg-(--stage-gold)"
                />
                <span class="text-sm font-semibold text-(--stage-ink)"
                  >For producers</span
                >
              </div>
            </div>
          </div>

          <StageStackedBoard
            title="The Improv Theater"
            subtitle="Tonight's Shows"
            badge="Live"
          >
            <div class="space-y-4">
              <div
                v-for="show in heroPreviewShows"
                :key="show.title"
                class="flex items-center justify-between gap-3 border-2 border-(--stage-ink) p-3 transition-colors hover:bg-(--stage-paper-strong)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-8 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-ink) text-xs font-bold text-(--stage-cream)"
                  >
                    {{ show.cast }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-(--stage-ink)">
                      {{ show.title }}
                    </div>
                    <div class="text-xs stage-muted">{{ show.time }}</div>
                  </div>
                </div>
                <span
                  class="border-2 border-(--stage-ink) px-2 py-0.5 text-xs font-bold text-(--stage-ink)"
                  :class="show.tone"
                >
                  {{ show.status }}
                </span>
              </div>
            </div>

            <div class="mt-6 flex gap-2">
              <div
                class="flex-1 border-2 border-(--stage-ink) bg-(--stage-event) px-4 py-2 text-center text-sm font-bold text-(--stage-ink)"
              >
                Add Show
              </div>
              <div
                class="flex-1 border-2 border-(--stage-ink) bg-(--stage-paper-strong) px-4 py-2 text-center text-sm font-bold text-(--stage-ink)"
              >
                View All
              </div>
            </div>
            <template #left-callout>
              <div
                class="absolute -left-5 top-1/4 border-2 border-(--stage-ink) bg-(--stage-cream) px-3 py-2 shadow-[4px_4px_0_0_var(--stage-ink)]"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="size-3 border border-(--stage-ink) bg-(--stage-performer)"
                  />
                  <span class="text-xs font-bold text-(--stage-ink)"
                    >Cast Confirmed</span
                  >
                </div>
              </div>
            </template>

            <template #right-callout>
              <div
                class="absolute -right-4 bottom-1/4 border-2 border-(--stage-ink) bg-(--stage-cream) px-3 py-2 shadow-[4px_4px_0_0_var(--stage-ink)]"
              >
                <span class="text-xs font-bold text-(--stage-ink)"
                  >+3 invites sent</span
                >
              </div>
            </template>
          </StageStackedBoard>
        </div>
      </div>
    </section>

    <section
      class="bg-(--stage-ink) px-4 py-16 text-(--stage-cream) sm:px-6 lg:px-8 lg:py-24"
    >
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 max-w-3xl space-y-4">
          <span
            class="inline-block border-2 border-(--stage-event) bg-(--stage-event) px-3 py-1 text-sm font-bold uppercase text-(--stage-ink)"
          >
            The Problem
          </span>
          <h2 class="stage-section-title max-w-3xl text-(--stage-cream)">
            Running a show shouldn't require six different tools
          </h2>
          <p class="text-lg leading-8 text-[rgba(251,247,239,0.72)]">
            Improv communities have been patching together solutions forever.
            The result? Missed lineups, confused performers, and producers
            drowning in coordination.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="problem in problems"
            :key="problem.title"
            class="group stage-article-card-dark p-6 text-(--stage-cream) transition-all hover:-translate-y-px] hover:bg-[rgba(251,247,239,0.12)] hover:shadow-[8px_8px_0_0_var(--stage-ink)]"
          >
            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-paper-strong) text-(--stage-ink) transition-colors group-hover:bg-(--stage-coral)"
              >
                <span class="size-3 bg-current" />
              </div>
              <span
                class="text-sm font-semibold text-[rgba(251,247,239,0.74)] line-through decoration-(--stage-coral)"
              >
                {{ problem.tool }}
              </span>
            </div>
            <h3 class="mb-2 text-lg font-bold text-(--stage-cream)">
              {{ problem.title }}
            </h3>
            <p class="text-sm italic text-[rgba(251,247,239,0.5)]">
              "{{ problem.detail }}"
            </p>
          </article>
        </div>

        <div class="mt-12 border-t-2 border-[rgba(251,247,239,0.2)] pt-8">
          <p class="text-center text-xl font-semibold md:text-2xl">
            There's no single, purpose-built tool that reflects how improv
            communities
            <span class="text-(--stage-event)"> actually operate</span>.
          </p>
        </div>
      </div>
    </section>

    <section
      id="features"
      class="bg-(--stage-cream) px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <span
            class="inline-block border-2 border-(--stage-ink) bg-(--stage-theater) px-3 py-1 text-sm font-bold uppercase text-(--stage-ink)"
          >
            The Solution
          </span>
          <h2 class="stage-section-title mx-auto mt-4 max-w-3xl">
            One platform for your entire improv community
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 stage-muted">
            Stagecom centralizes everything your theater needs. From casting to
            show day, keep your people connected.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="group border-4 border-(--stage-ink) bg-(--stage-paper-strong) p-6 transition-all hover:shadow-[8px_8px_0_0_var(--stage-ink)]"
            :class="[feature.span, feature.tone]"
          >
            <div
              class="mb-4 flex size-12 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-cream)"
            >
              <span class="text-lg font-black text-(--stage-ink)">+</span>
            </div>
            <h3 class="mb-2 text-lg font-bold text-(--stage-ink)">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-[rgba(43,41,38,0.78)]">
              {{ feature.description }}
            </p>
          </article>
        </div>

        <div class="mt-16 flex items-center justify-center gap-4">
          <div class="h-1 w-16 bg-(--stage-ink)" />
          <div
            class="size-3 rotate-45 border-2 border-(--stage-ink) bg-(--stage-event)"
          />
          <div class="h-1 w-16 bg-(--stage-ink)" />
        </div>
      </div>
    </section>

    <section
      id="roles"
      class="bg-(--stage-paper-strong) px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <span
            class="inline-block border-2 border-(--stage-ink) bg-(--stage-performer) px-3 py-1 text-sm font-bold uppercase text-(--stage-ink)"
          >
            For Your Role
          </span>
          <h2 class="stage-section-title mx-auto mt-4 max-w-3xl">
            Built for everyone in your community
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 stage-muted">
            Different roles, different needs. Stagecom gives each person in your
            theater exactly what they need to stay connected and effective.
          </p>
        </div>

        <div class="mb-8 flex flex-wrap justify-center gap-2">
          <button
            v-for="roleKey in Object.keys(roles)"
            :key="roleKey"
            type="button"
            class="flex items-center gap-2 border-4 border-(--stage-ink) px-6 py-3 font-bold transition-all"
            :class="
              activeRole === roleKey
                ? `${roles[roleKey as keyof typeof roles].tone} shadow-[4px_4px_0_0_var(--stage-ink)] text-(--stage-ink)`
                : 'bg-(--stage-cream) text-(--stage-ink) hover:bg-(--stage-ink) hover:text-(--stage-cream)'
            "
            @click="
              activeRole = roleKey as 'managers' | 'producers' | 'performers'
            "
          >
            {{ roles[roleKey as keyof typeof roles].label }}
          </button>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
          <div class="border-4 border-(--stage-ink) bg-(--stage-cream) p-8">
            <div class="mb-6">
              <h3 class="font-display text-3xl text-(--stage-ink)">
                {{ activeRoleData.label }}
              </h3>
              <p class="stage-muted">{{ activeRoleData.subtitle }}</p>
            </div>

            <ul class="space-y-4">
              <li
                v-for="benefit in activeRoleData.benefits"
                :key="benefit"
                class="flex items-start gap-3"
              >
                <div
                  class="mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-(--stage-ink) text-(--stage-ink)"
                  :class="activeRoleData.tone"
                >
                  <span class="text-xs font-black">✓</span>
                </div>
                <span class="text-(--stage-ink)">{{ benefit }}</span>
              </li>
            </ul>
          </div>

          <div class="relative">
            <div
              class="absolute -right-2 -top-2 size-full border-4 border-(--stage-ink)"
              :class="activeRoleData.tone"
            />
            <div
              class="relative flex h-full flex-col justify-between border-4 border-(--stage-ink) bg-(--stage-ink) p-8"
            >
              <div>
                <div
                  class="mb-6 text-6xl font-black text-[rgba(251,247,239,0.2)]"
                >
                  “
                </div>
                <blockquote
                  class="text-xl font-medium leading-9 text-(--stage-cream) md:text-2xl"
                >
                  {{ activeRoleData.quote }}
                </blockquote>
              </div>
              <div class="mt-8 flex items-center gap-3">
                <div
                  class="size-12 border-2 border-[rgba(251,247,239,0.3)]"
                  :class="activeRoleData.tone"
                />
                <div>
                  <div class="font-bold text-(--stage-cream)">
                    {{ activeRoleData.label.replace(/s$/, "") }}
                  </div>
                  <div class="text-sm text-[rgba(251,247,239,0.6)]">
                    Local Improv Theater
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="mt-12 border-4 border-(--stage-ink) bg-(--stage-cream) p-6 text-center"
        >
          <p class="text-(--stage-ink)">
            <strong>Roles are contextual, not permanent.</strong>
            You can be a producer for one show and a performer in another.
            Stagecom understands how improv communities actually work.
          </p>
        </div>
      </div>
    </section>

    <section
      id="product"
      class="bg-(--stage-ink) px-4 py-16 text-(--stage-cream) sm:px-6 lg:px-8 lg:py-24"
    >
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <span
            class="inline-block border-2 border-(--stage-event) bg-(--stage-event) px-3 py-1 text-sm font-bold uppercase text-(--stage-ink)"
          >
            The Product
          </span>
          <h2
            class="stage-section-title mx-auto mt-4 max-w-3xl text-(--stage-cream)"
          >
            See what Stagecom looks like in action
          </h2>
          <p
            class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[rgba(251,247,239,0.72)]"
          >
            Clean, clear, and built for the real workflows of improv
            communities. No learning curve, no intimidation.
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <StageFeatureCard
            v-for="card in showcaseCards"
            :key="card.title"
            :title="card.title"
            :subtitle="card.subtitle"
            :tone="card.tone"
          >
            <div v-if="card.kind === 'setup'" class="space-y-4">
              <div
                class="flex items-center justify-between border-b-2 border-[rgba(43,41,38,0.1)] pb-3"
              >
                <div>
                  <div class="font-bold">Friday Night Showcase</div>
                  <div class="text-sm stage-muted">Jan 24, 2026 at 8:00 PM</div>
                </div>
                <span
                  class="border-2 border-(--stage-ink) bg-(--stage-event) px-2 py-1 text-xs font-bold uppercase"
                >
                  Draft
                </span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="border-2 border-[rgba(43,41,38,0.18)] p-3">
                  <div class="text-xs font-semibold uppercase stage-muted">
                    Producer
                  </div>
                  <div class="font-medium">Alex Rivera</div>
                </div>
                <div class="border-2 border-[rgba(43,41,38,0.18)] p-3">
                  <div class="text-xs font-semibold uppercase stage-muted">
                    Casting
                  </div>
                  <div class="font-medium">Theater Members</div>
                </div>
              </div>
              <div class="border-2 border-[rgba(43,41,38,0.18)] p-3">
                <div class="mb-2 text-xs font-semibold uppercase stage-muted">
                  Cast Size
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-2 flex-1 bg-[rgba(43,41,38,0.12)]">
                    <div class="h-full w-2/3 bg-(--stage-coral)" />
                  </div>
                  <span class="text-sm font-bold">4-6 performers</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="flex-1 border-2 border-(--stage-ink) bg-(--stage-coral) py-2 text-sm font-bold text-(--stage-cream)"
                >
                  Invite Cast
                </button>
                <button
                  class="flex-1 border-2 border-(--stage-ink) bg-(--stage-cream) py-2 text-sm font-bold"
                >
                  Save Draft
                </button>
              </div>
            </div>

            <div v-else-if="card.kind === 'invites'" class="space-y-3">
              <div
                v-for="invite in inviteRows"
                :key="invite.name"
                class="flex items-center justify-between border-2 border-[rgba(43,41,38,0.1)] p-2"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-8 border-2 border-[rgba(43,41,38,0.18)] bg-(--stage-paper-strong)"
                  />
                  <span class="text-sm font-medium">{{ invite.name }}</span>
                </div>
                <div
                  class="flex items-center gap-1 border-2 border-(--stage-ink) px-2 py-0.5 text-xs font-bold"
                  :class="invite.tone"
                >
                  <span>{{ invite.status }}</span>
                </div>
              </div>
              <div
                class="mt-4 flex items-center justify-between border-t-2 border-[rgba(43,41,38,0.1)] pt-3"
              >
                <div class="text-sm stage-muted">
                  <span class="font-bold text-(--stage-ink)">2</span> confirmed,
                  <span class="font-bold text-(--stage-ink)"> 2</span> pending
                </div>
                <button
                  class="border-2 border-(--stage-ink) bg-(--stage-cream) px-3 py-1 text-xs font-bold"
                >
                  Send Reminder
                </button>
              </div>
            </div>

            <div v-else-if="card.kind === 'lineup'" class="space-y-2">
              <div
                v-for="row in lineupRows"
                :key="row.order"
                class="flex items-center gap-3 border-2 border-[rgba(43,41,38,0.1)] p-2"
              >
                <div
                  class="flex size-8 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-ink) text-sm font-bold text-(--stage-cream)"
                >
                  {{ row.order }}
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ row.title }}</div>
                  <div class="text-xs stage-muted">{{ row.team }}</div>
                </div>
                <div class="text-sm font-medium text-[rgba(43,41,38,0.7)]">
                  {{ row.time }}
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2 text-sm stage-muted">
                <span
                  class="size-4 border-2 border-(--stage-ink) bg-(--stage-paper-strong)"
                />
                <span>Estimated runtime: 1h 30m</span>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="row in reviewRows"
                :key="row.title"
                class="flex items-center justify-between gap-3 border-2 border-[rgba(43,41,38,0.1)] p-3"
              >
                <div>
                  <div class="text-sm font-medium">{{ row.title }}</div>
                  <div class="text-xs stage-muted">by {{ row.author }}</div>
                </div>
                <div v-if="row.pending" class="flex gap-1">
                  <button
                    class="border-2 border-(--stage-ink) bg-(--stage-theater) px-2 py-1 text-xs font-bold"
                  >
                    Approve
                  </button>
                  <button
                    class="border-2 border-(--stage-ink) bg-(--stage-cream) px-2 py-1 text-xs font-bold"
                  >
                    Review
                  </button>
                </div>
                <span
                  v-else
                  class="border-2 border-(--stage-ink) bg-(--stage-theater) px-2 py-1 text-xs font-bold"
                >
                  Approved
                </span>
              </div>
              <div
                class="mt-4 border-t-2 border-[rgba(43,41,38,0.1)] pt-3 text-center"
              >
                <span class="text-sm stage-muted">
                  <span class="font-bold text-(--stage-coral)">2</span> items
                  need review
                </span>
              </div>
            </div>
          </StageFeatureCard>
        </div>

        <div
          class="mt-8 border-4 border-[rgba(251,247,239,0.2)] bg-(--stage-ink) p-6"
        >
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex size-10 items-center justify-center border-2 border-[rgba(251,247,239,0.3)]"
            >
              <span class="size-4 bg-(--stage-cream)" />
            </div>
            <div>
              <div class="font-bold text-(--stage-cream)">
                Real-time Notifications
              </div>
              <div class="text-sm text-[rgba(251,247,239,0.6)]">
                In-app and email updates
              </div>
            </div>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <div
              v-for="item in notifications"
              :key="item.text"
              class="border-2 px-3 py-2 text-sm text-(--stage-cream)"
              :class="item.tone"
            >
              {{ item.text }}
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <p class="mb-4 text-[rgba(251,247,239,0.7)]">
            Product screens are concept mockups. The real thing is being built
            right now.
          </p>
          <a
            href="#waitlist"
            class="inline-flex items-center gap-2 font-bold text-(--stage-event) transition-colors hover:text-(--stage-theater)"
          >
            Follow the build
            <span aria-hidden="true">›</span>
          </a>
        </div>
      </div>
    </section>

    <section class="bg-(--stage-cream) px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <span
            class="inline-block border-2 border-(--stage-ink) bg-(--stage-ink) px-3 py-1 text-sm font-bold uppercase text-(--stage-cream)"
          >
            Our Principles
          </span>
          <h2 class="stage-section-title mx-auto mt-4 max-w-3xl">
            Built on how improv actually works
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 stage-muted">
            These aren't just features. They're the beliefs that shape every
            decision we make building Stagecom.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="principle in principles"
            :key="principle.title"
            class="group border-4 border-(--stage-ink) bg-(--stage-paper-strong) p-6 transition-all hover:bg-(--stage-ink) hover:shadow-[8px_8px_0_0_var(--stage-theater)]"
          >
            <div
              class="mb-4 flex size-12 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-cream) transition-colors group-hover:bg-(--stage-theater)"
            >
              <span class="size-4 bg-(--stage-ink)" />
            </div>
            <h3
              class="mb-2 text-lg font-bold text-(--stage-ink) transition-colors group-hover:text-(--stage-cream)"
            >
              {{ principle.title }}
            </h3>
            <p
              class="text-sm text-[rgba(43,41,38,0.72)] transition-colors group-hover:text-[rgba(251,247,239,0.72)]"
            >
              {{ principle.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section
      id="waitlist"
      class="relative overflow-hidden bg-(--stage-ink) px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div
        class="absolute inset-0 opacity-[0.06]"
        style="
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            #fdfcfb 20px,
            #fdfcfb 21px
          );
        "
      />
      <div class="relative mx-auto max-w-4xl text-center">
        <div class="relative">
          <div
            class="absolute -inset-4 border-4 border-(--stage-theater) md:-inset-8"
          />
          <div
            class="absolute -inset-2 border-4 border-[rgba(251,247,239,0.2)] md:-inset-6"
          />

          <div class="relative bg-(--stage-ink) p-8 md:p-12">
            <div
              class="mb-6 inline-flex items-center gap-2 border-2 border-[rgba(251,247,239,0.3)] px-4 py-2"
            >
              <span class="relative flex size-2.5">
                <span
                  class="absolute inline-flex size-full animate-ping bg-(--stage-theater) opacity-75"
                />
                <span
                  class="relative inline-flex size-2.5 bg-(--stage-theater)"
                />
              </span>
              <span class="text-sm font-semibold text-(--stage-cream)">
                Actively building with early partners
              </span>
            </div>

            <h2
              class="stage-section-title text-(--stage-cream) md:text-[clamp(2.8rem,5vw,4.75rem)]"
            >
              Ready to simplify your theater operations?
            </h2>

            <p
              class="mx-auto mt-6 max-w-xl text-lg leading-8 text-[rgba(251,247,239,0.72)]"
            >
              Join the waitlist for early access. We're building Stagecom with
              real theaters and communities, and we'd love your input.
            </p>

            <div
              class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <UButton
                to="/signup"
                size="lg"
                icon="i-heroicons-arrow-right"
                trailing
              >
                Join the waitlist
              </UButton>
              <UButton
                to="/theaters"
                size="lg"
                variant="outline"
                class="border-(--stage-cream)! text-(--stage-cream)! hover:bg-(--stage-cream)! hover:text-(--stage-ink)!"
              >
                Contact us
              </UButton>
            </div>

            <p class="mt-8 text-sm text-[rgba(251,247,239,0.5)]">
              No spam. Just updates on what we're building for improv
              communities.
            </p>
          </div>
        </div>

        <div
          class="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
        >
          <a
            href="#roles"
            class="font-semibold text-[rgba(251,247,239,0.7)] transition-colors hover:text-(--stage-theater)"
            >For Theaters</a
          >
          <span class="text-[rgba(251,247,239,0.3)]">|</span>
          <a
            href="#roles"
            class="font-semibold text-[rgba(251,247,239,0.7)] transition-colors hover:text-(--stage-event)"
            >For Producers</a
          >
          <span class="text-[rgba(251,247,239,0.3)]">|</span>
          <a
            href="#roles"
            class="font-semibold text-[rgba(251,247,239,0.7)] transition-colors hover:text-(--stage-performer)"
            >For Performers</a
          >
        </div>
      </div>
    </section>
  </div>
</template>
