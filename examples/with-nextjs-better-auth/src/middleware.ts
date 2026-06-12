import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route guard for the protected dashboard. Visitors without a Better Auth
 * session cookie are redirected to the public landing.
 *
 * This is an *optimistic* check: `getSessionCookie` only reads the signed
 * session cookie (no database call), which is what keeps it edge-safe and fast.
 * The actual session validity is enforced by the server routes
 * (`getSession`/`getAccessToken`), which 401 on an invalid/expired session — the
 * client bounces back to `/` on that. Per Better Auth's middleware guidance.
 */
export const middleware = (request: NextRequest): NextResponse => {
  const sessionCookie = getSessionCookie(request);
  if (sessionCookie === null) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }
  return NextResponse.next();
};

export const config = {
  matcher: [`/dashboard`]
};
