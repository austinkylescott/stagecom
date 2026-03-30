// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "app",
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
    "@vueuse/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  fonts: {
    defaults: { weights: [400, 600, 700], styles: ["normal"] },
    families: [
      { name: "Public Sans", global: true },
      { name: "Bebas Neue", global: true },
      { name: "Merriweather", global: true },
      { name: "JetBrains Mono", global: true },
    ],
  },
  pinia: {},
  supabase: {
    types: "~/types/database.types.ts",
    redirect: false,
  },
});
