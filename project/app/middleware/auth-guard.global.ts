const protectedRouteMatchers = [
  /^\/profile$/,
  /^\/shows$/,
  /^\/review$/,
  /^\/theaters\/new$/,
  /^\/theaters\/[^/]+\/review$/,
  /^\/theaters\/[^/]+\/shows\/new$/,
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
