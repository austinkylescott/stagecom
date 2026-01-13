<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";

const supabase = useSupabaseClient();
const toast = useToast();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  // We’re doing magic-link OTP for now, so no password field.
  // Add this later if you switch to password auth.
  // {
  //   name: "password",
  //   label: "Password",
  //   type: "password",
  //   placeholder: "Enter your password",
  //   required: true,
  // },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
  },
];

const schema = z.object({
  email: z.string().email("Invalid email"),
  remember: z.boolean().optional(),
});

type Schema = z.output<typeof schema>;

const providers = [
  {
    label: "Google",
    icon: "i-simple-icons-google",
    onClick: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/confirm`,
        },
      });
      if (error) {
        toast.add({
          title: "Google sign-in failed",
          description: error.message,
          color: "red",
        });
      }
    },
  },
  {
    label: "GitHub",
    icon: "i-simple-icons-github",
    onClick: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/confirm`,
        },
      });
      if (error) {
        toast.add({
          title: "GitHub sign-in failed",
          description: error.message,
          color: "red",
        });
      }
    },
  },
];

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const email = payload.data.email;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/confirm`,
    },
  });

  if (error) {
    toast.add({
      title: "Sign-in failed",
      description: error.message,
      color: "red",
    });
    return;
  }

  toast.add({
    title: "Check your email",
    description: "We sent you a magic link to finish signing in.",
  });
}
</script>

<template>
  <div
    class="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 p-4"
  >
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your email to receive a magic link."
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
