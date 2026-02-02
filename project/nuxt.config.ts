// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "app",
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase"],
  css: ["~/assets/css/main.css"],
  fonts: {
    defaults: { weights: [400, 600, 700], styles: ["normal"] },
    families: [
      { name: "Space Grotesk", global: true },
      { name: "Silkscreen", global: true },
      { name: "Merriweather", global: true },
      { name: "Fira Code", global: true },
    ],
  },
  supabase: {
    types: "~/types/database.types.ts",
    redirect: false,
  },
});
