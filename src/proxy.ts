import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
  "/",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
