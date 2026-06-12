import { NextResponse, type NextRequest } from "next/server";
import { unsealSession } from "#src/lib/session";

/**
 * Route guard for the protected dashboard. Unauthenticated visitors to
 * `/dashboard` are redirected to the public landing page. Centralizing the
 * check here (rather than in the page) keeps the protection boundary in one
 * place — add more protected paths to the matcher below.
 *
 * This reads + verifies the session cookie directly (it can't write cookies,
 * so it doesn't refresh — a near-expiry-but-present session still passes here;
 * the data routes refresh it, and a dead one surfaces as a 401 the client
 * bounces on). An absent/invalid cookie is treated as logged out.
 */
const COOKIE_NAME = `__Host-discord_session`;

export const middleware = async (
  request: NextRequest
): Promise<NextResponse> => {
  const session = await unsealSession(request.cookies.get(COOKIE_NAME)?.value);
  const usable =
    session !== null &&
    (session.expiresAt > Date.now() || session.refreshToken !== undefined);

  if (!usable) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }
  return NextResponse.next();
};

export const config = {
  matcher: [`/dashboard`]
};
