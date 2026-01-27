<script setup lang="ts">
import * as z from "zod";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const supabase = useSupabaseClient();
const authError = ref<string | null>(null);
const isSubmitting = ref(false);
const toast = useToast();

const signInWithOAuth = async (provider: "google" | "github") => {
  authError.value = null;
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) {
    authError.value = error.message;
  }
};

const fields: AuthFormField[] = [
  {
    name: "name",
    type: "text",
    label: "Full name",
    placeholder: "How should we greet you?",
    required: true,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Create a password",
    required: true,
  },
  {
    name: "confirm",
    label: "Confirm password",
    type: "password",
    placeholder: "Repeat your password",
    required: true,
  },
];

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: () => {
      toast.add({ title: "Google", description: "Continue with Google" });
      signInWithOAuth("google");
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: () => {
      toast.add({ title: "GitHub", description: "Continue with GitHub" });
      signInWithOAuth("github");
    },
  },
];

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Invalid email"),
    password: z
      .string("Password is required")
      .min(8, "Must be at least 8 characters"),
    confirm: z.string("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords must match",
    path: ["confirm"],
  });

type Schema = z.output<typeof schema>;

const onSubmit = async (payload: FormSubmitEvent<Schema>) => {
  authError.value = null;
  isSubmitting.value = true;

  const { data, error } = await supabase.auth.signUp({
    email: payload.data.email,
    password: payload.data.password,
    options: {
      data: {
        full_name: payload.data.name,
      },
      emailRedirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/confirm`
          : undefined,
    },
  });

  if (error) {
    authError.value = error.message;
  } else if (data.user?.aud === "authenticated") {
    // Email confirmation disabled, or user already confirmed
    await navigateTo("/");
  } else {
    await navigateTo("/confirm");
  }

  isSubmitting.value = false;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :providers="providers"
        title="Create your account"
        icon="i-lucide-user-plus"
        :loading="isSubmitting"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account?
          <ULink to="/login" class="text-primary font-medium">Log in</ULink>.
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
          By signing up, you agree to our
          <ULink to="#" class="text-primary font-medium">Terms of Service</ULink
          >.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
