const protectedRouteMatchers = [
  /^\/profile$/,
  /^\/shows$/,
  /^\/review$/,
  /^\/notifications$/,
  /^\/theaters\/new$/,
  /^\/theaters\/[^/]+\/review$/,
  /^\/theaters\/[^/]+\/shows\/new$/,
  /^\/theaters\/[^/]+\/shows\/[^/]+$/,
];

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  const isAuthed = Boolean(user.value);
  const isProtectedRoute = protectedRouteMatchers.some((matcher) =>
    matcher.test(to.path),
  );

  if (isProtectedRoute && !isAuthed) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
