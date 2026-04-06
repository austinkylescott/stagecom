<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import type { FetchError } from "ofetch";
import { queryKeys } from "~/composables/queryKeys";

const router = useRouter();

const form = reactive({
  name: "",
  tagline: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  street: "",
  city: "",
  state_region: "",
  postal_code: "",
  country: "",
  website_url: "",
  logo_url: "",
});

const slugPreview = computed(() => {
  const base = form.name
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "will-be-generated";
});

const requiredFieldCount = 8;

const loading = ref(false);
const error = ref("");
const notice = ref("");

type TheaterResponse = { id: string; slug: string };

const requiredFieldChecks = [
  { key: "name", label: "Name" },
  { key: "tagline", label: "Tagline" },
  { key: "timezone", label: "Timezone" },
  { key: "street", label: "Street address" },
  { key: "city", label: "City" },
  { key: "state_region", label: "State/Region" },
  { key: "postal_code", label: "Postal code" },
  { key: "country", label: "Country" },
] as const;

const getCreateErrorMessage = (e: FetchError<any>) => {
  const firstIssue =
    e?.data?.issues?.[0]?.message || e?.data?.data?.issues?.[0]?.message;

  return (
    firstIssue ||
    e?.data?.statusMessage ||
    e?.data?.message ||
    e?.message ||
    "Failed to create theater"
  );
};

const queryCache = useQueryCache();
const createTheater = useMutation<TheaterResponse, typeof form>({
  mutation: (payload) =>
    $fetch<TheaterResponse>("/api/theaters", {
      method: "POST",
      body: { ...payload },
      credentials: "include",
    }),
  onSuccess: async (theater) => {
    notice.value = "Theater created";
    await Promise.all([
      queryCache.invalidateQueries({ key: queryKeys.theaters(), exact: false }),
      queryCache.invalidateQueries({
        key: queryKeys.homeTheater(),
        exact: true,
      }),
    ]);
    await router.push(`/theaters/${theater.slug}/shows/new`);
  },
  onError: (e: any) => {
    error.value = getCreateErrorMessage(e as FetchError<any>);
  },
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  const missingField = requiredFieldChecks.find(
    ({ key }) => !form[key as keyof typeof form].trim(),
  );

  if (missingField) {
    error.value = `${missingField.label} is required`;
    loading.value = false;
    return;
  }

  try {
    await createTheater.mutateAsync(form);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-theater) overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
        <div class="space-y-5">
          <div class="border-b-2 border-stage-ink/15 pb-4">
            <p
              class="text-xs font-semibold uppercase tracking-[0.14em] text-stage-ink/60"
            >
              New theater
            </p>
          </div>

          <div class="space-y-3">
            <h1
              class="max-w-4xl font-display text-[clamp(2.8rem,10vw,6.4rem)] uppercase leading-[0.88] tracking-[0.03em] text-(--stage-ink)"
            >
              Build the public home base first.
            </h1>
            <p class="max-w-3xl text-base leading-7 text-stage-ink/80 sm:text-lg">
              A theater page only works if the identity is real. Start with the
              name, tagline, timezone, and full address that distinguish this
              theater from every other room in the city.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stage-stat">
              <span class="stage-overline">Required now</span>
              <span class="stage-stat-value">{{ requiredFieldCount }}</span>
              <p class="mt-2 text-sm stage-muted">
                Identity, timezone, and full address.
              </p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Route preview</span>
              <span class="stage-stat-value !text-2xl">{{ slugPreview }}</span>
              <p class="mt-2 text-sm stage-muted">
                Generated from the theater name.
              </p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Creator role</span>
              <span class="stage-stat-value !text-2xl">Admin</span>
              <p class="mt-2 text-sm stage-muted">
                The creator becomes a theater admin immediately.
              </p>
            </div>
          </div>
        </div>

        <section class="stage-panel p-5 sm:p-6">
          <p class="stage-overline">What the page needs</p>
          <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
            Required identity
          </h2>
          <div class="mt-4 space-y-3 text-sm leading-7 stage-muted">
            <p>Name and tagline tell people which theater this is.</p>
            <p>Timezone keeps every show and event in the right local context.</p>
            <p>
              Full address is what separates one theater from another in the
              real world.
            </p>
            <p>Website and logo can help, but they should not block creation.</p>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <StageButton variant="ghost" tone="neutral" to="/theaters">
              Theater hub
            </StageButton>
          </div>
        </section>
      </div>
    </StageSection>

    <TheaterDetailSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      overline="Create theater"
      title="Public identity and location"
      description="Fill the required theater identity first, then add optional public profile links without slowing down the creation flow."
      description-class="max-w-3xl"
    >
      <section class="stage-panel p-5 sm:p-6">
        <UForm class="space-y-8" @submit.prevent="handleSubmit">
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="space-y-8">
              <section class="space-y-4">
                <div>
                  <p class="stage-overline">Identity</p>
                  <h3
                    class="mt-2 font-display text-3xl uppercase tracking-[0.08em]"
                  >
                    Theater basics
                  </h3>
                </div>

                <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
                  <UFormField label="Name" required>
                    <UInput
                      v-model="form.name"
                      placeholder="Bright Comedy"
                      autocomplete="organization"
                    />
                  </UFormField>

                  <UFormField
                    label="Timezone"
                    required
                    description="IANA timezone"
                  >
                    <UInput
                      v-model="form.timezone"
                      placeholder="America/New_York"
                      autocapitalize="off"
                      spellcheck="false"
                    />
                  </UFormField>
                </div>

                <UFormField
                  label="Tagline"
                  required
                  description="Short public line used on the theater page"
                >
                  <UInput
                    v-model="form.tagline"
                    placeholder="Late-night improv room with weekly shows and classes"
                  />
                </UFormField>
              </section>

              <section class="space-y-4 border-t-2 border-stage-ink/10 pt-6">
                <div>
                  <p class="stage-overline">Location</p>
                  <h3
                    class="mt-2 font-display text-3xl uppercase tracking-[0.08em]"
                  >
                    Full address
                  </h3>
                </div>

                <UFormField label="Street address" required>
                  <UInput
                    v-model="form.street"
                    placeholder="123 Main St"
                    autocomplete="street-address"
                  />
                </UFormField>

                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <UFormField label="City" required>
                    <UInput
                      v-model="form.city"
                      placeholder="Chicago"
                      autocomplete="address-level2"
                    />
                  </UFormField>
                  <UFormField label="State/Region" required>
                    <UInput
                      v-model="form.state_region"
                      placeholder="IL"
                      autocomplete="address-level1"
                    />
                  </UFormField>
                  <UFormField label="Postal code" required>
                    <UInput
                      v-model="form.postal_code"
                      placeholder="60601"
                      autocomplete="postal-code"
                    />
                  </UFormField>
                  <UFormField label="Country" required>
                    <UInput
                      v-model="form.country"
                      placeholder="USA"
                      autocomplete="country-name"
                    />
                  </UFormField>
                </div>
              </section>

              <section class="space-y-4 border-t-2 border-stage-ink/10 pt-6">
                <div>
                  <p class="stage-overline">Profile links</p>
                  <h3
                    class="mt-2 font-display text-3xl uppercase tracking-[0.08em]"
                  >
                    Optional public links
                  </h3>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <UFormField
                    label="Website URL"
                    description="Optional public site"
                  >
                    <UInput
                      v-model="form.website_url"
                      type="url"
                      placeholder="https://brightcomedy.com"
                      autocapitalize="off"
                      spellcheck="false"
                    />
                  </UFormField>
                  <UFormField
                    label="Logo URL"
                    description="Optional image URL"
                  >
                    <UInput
                      v-model="form.logo_url"
                      type="url"
                      placeholder="https://images.example.com/bright-comedy-logo.png"
                      autocapitalize="off"
                      spellcheck="false"
                    />
                  </UFormField>
                </div>
              </section>
            </div>

            <aside
              class="space-y-4 border-t-2 border-stage-ink/10 pt-6 xl:border-t-0 xl:border-l-2 xl:border-stage-ink/10 xl:pl-6 xl:pt-0"
            >
              <section class="stage-panel bg-[rgba(130,191,182,0.2)] p-4">
                <p class="stage-overline">Route</p>
                <p class="mt-2 text-sm leading-7 text-stage-ink/80">
                  <span class="font-semibold text-stage-ink">/theaters/</span>
                  {{ slugPreview }}
                </p>
              </section>

              <section class="stage-panel p-4">
                <p class="stage-overline">Required before create</p>
                <div class="mt-3 space-y-2 text-sm leading-7 text-stage-ink/80">
                  <p>Name</p>
                  <p>Tagline</p>
                  <p>Timezone</p>
                  <p>Street address</p>
                  <p>City</p>
                  <p>State/Region</p>
                  <p>Postal code</p>
                  <p>Country</p>
                </div>
              </section>
            </aside>
          </div>

          <div class="border-t-2 border-stage-ink/10 pt-5">
            <div class="flex flex-wrap items-center gap-3">
              <StageButton
                :loading="loading"
                tone="theater"
                type="submit"
                icon="i-heroicons-building-library"
              >
                Create theater
              </StageButton>
              <p class="text-sm stage-muted">
                Creator becomes theater admin immediately.
              </p>
              <p v-if="notice" class="text-sm text-emerald-700">{{ notice }}</p>
              <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </UForm>
      </section>
    </TheaterDetailSection>
  </div>
</template>
