<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const supabase = useSupabaseClient();
const route = useRoute();
const authError = ref<string | null>(null);
const isSubmitting = ref(false);
const redirectTarget = computed(() => {
  const redirect = route.query.redirect;
  return typeof redirect === "string" && redirect.startsWith("/")
    ? redirect
    : "/";
});

const signInWithOAuth = async (provider: "google" | "github") => {
  authError.value = null;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
  });
  if (error) {
    authError.value = error.message;
  }
};

const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "Login with Google" });
      signInWithOAuth("google");
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: "GitHub", description: "Login with GitHub" });
      signInWithOAuth("github");
    },
  },
];

const schema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string("Password is required")
    .min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  authError.value = null;
  isSubmitting.value = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password,
  });

  if (error) {
    authError.value = error.message;
  } else {
    await navigateTo(redirectTarget.value);
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div class="space-y-8 px-4 py-6">
    <section class="mx-auto w-full max-w-3xl stage-panel stage-texture overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
      <span class="stage-kicker">Welcome back</span>
      <h1 class="mt-4 stage-section-title">Sign in to run your scene.</h1>
      <p class="mt-3 max-w-2xl text-lg leading-8 stage-muted">
        Auth screens should live inside the same homepage system, even while relying on Nuxt UI form primitives.
      </p>
    </section>
    <div class="flex flex-col items-center justify-center gap-4">
      <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :providers="providers"
        title="Welcome back!"
        icon="i-lucide-lock"
        :loading="isSubmitting"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account?
          <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1"
            >Forgot password?</ULink
          >
        </template>
        <template #validation>
          <UAlert
            v-if="authError"
            color="error"
            icon="i-lucide-info"
            :title="authError"
          />
        </template>
        <template #footer>
          By signing in, you agree to our
          <ULink to="#" class="text-primary font-medium">Terms of Service</ULink
          >.
        </template>
      </UAuthForm>
      </UPageCard>
    </div>
  </div>
</template>
