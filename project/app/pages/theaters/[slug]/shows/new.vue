<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import type { FetchError } from "ofetch";
import { queryKeys } from "~/composables/queryKeys";

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

const queryCache = useQueryCache();
const createShow = useMutation<void, { submitForReview: boolean }>({
  mutation: ({ submitForReview }) =>
    $fetch(`/api/theaters/${slug.value}/shows`, {
      method: "POST",
      body: { ...form, submitForReview },
      credentials: "include",
    }),
  onSuccess: async (_data, vars) => {
    notice.value = vars.submitForReview
      ? "Submitted for review"
      : "Show saved as draft";
    await Promise.all([
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theaterReview(slug.value || ""),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theater(slug.value || ""),
        exact: false,
      }),
    ]);
    await router.push(`/theaters/${slug.value}/review`);
  },
  onError: (e: any) => {
    const err = e as FetchError<any>;
    error.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Failed to save show";
  },
});

const submit = async (submitForReview: boolean) => {
  loading.value = true;
  error.value = "";
  notice.value = "";

  try {
    await createShow.mutateAsync({ submitForReview });
  } finally {
    loading.value = false;
  }
};
</script>
