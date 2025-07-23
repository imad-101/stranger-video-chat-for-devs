import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/video-chat(.*)",
  "/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to pass through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For protected routes, check if user is authenticated
  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      // Redirect to sign-in with the intended destination
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
