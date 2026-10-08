import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  `${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}(.*)`,
  `${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}(.*)`,
  "/",
]);

// API routes run their own auth check so unauthenticated requests receive a
// JSON 401 from the handler instead of the middleware's default 404 response.
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req) || isApiRoute(req)) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
