<script setup lang="ts">
import type { FetchError } from "ofetch";

const route = useRoute();
const router = useRouter();

const slug = computed(() => route.params.slug as string);

const form = reactive({
  title: "",
  description: "",
  castingMode: "direct_invite",
  startsAt: "",
  endsAt: "",
});

const loading = ref(false);
const error = ref("");
const notice = ref("");

const submit = async (submitForReview: boolean) => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  try {
    await $fetch(`/api/theaters/${slug.value}/shows`, {
      method: "POST",
      // ✅ pass an object; $fetch will JSON-encode it
      body: { ...form, submitForReview },
      // ✅ include if your API uses cookies/session
      credentials: "include",
    });

    notice.value = submitForReview
      ? "Submitted for review"
      : "Show saved as draft";
    await router.push(`/theaters/${slug.value}/review`);
  } catch (e) {
    const err = e as FetchError<any>;
    error.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Failed to save show";
  } finally {
    loading.value = false;
  }
};
</script>
