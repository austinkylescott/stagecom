# Data Layer

This project uses Pinia Colada for query state and mutations. The goal is to keep data flows predictable:

- Reads are Colada queries.
- Writes are Colada mutations.
- Mutations invalidate query keys (and may do optimistic updates).

## Query keys

Keys live in `app/composables/queryKeys.ts` and should be used everywhere to avoid mismatches.

Example:

```ts
import { queryKeys } from "~/composables/queryKeys";

const options = defineQueryOptions((params) => ({
  key: queryKeys.theater(params.slug),
  query: () => $fetch(`/api/theaters/${params.slug}`),
}));
```

## Adding a new query

1. Create a composable in `app/composables/` using `defineQueryOptions` + `useQuery`.
2. Use `queryKeys` for the key.
3. Use `$fetch` directly (include `credentials: "include"` for auth routes, and `useRequestHeaders(["cookie"])` on SSR).
4. Return `isLoading`, `error`, and `data` from the composable.

Example:

```ts
const myQueryOptions = defineQueryOptions((params) => ({
  key: queryKeys.memberShows(),
  query: () => $fetch("/api/shows", { credentials: "include" }),
  staleTime: 20_000,
}));

export const useMemberShows = () => useQuery(myQueryOptions);
```

## Adding a new mutation

1. Use `useMutation` in a composable or page.
2. In `onSuccess`, invalidate the relevant query keys via `useQueryCache().invalidateQueries`.
3. Optional: use `onMutate` for optimistic updates and revert in `onError`.

Example:

```ts
const queryCache = useQueryCache();
const mutation = useMutation({
  mutation: (payload) => $fetch("/api/theaters", { method: "POST", body: payload }),
  onSuccess: () => queryCache.invalidateQueries({ key: queryKeys.theaters(), exact: false }),
});
```

## When to extract a composable

- Use a composable if the query is shared across multiple pages/components.
- Keep data fetching in the page when it’s truly single-use.
