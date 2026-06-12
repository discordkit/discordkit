import type { APIRoute } from "astro";
import { auth } from "#src/lib/discord";

// Discord redirects back here with `code` + `state`. The handler verifies the
// state (CSRF), exchanges the code (with PKCE), runs `onSuccess` to seal the
// session cookie, clears the transient flow cookies, and redirects home.
export const GET: APIRoute = auth.callback;
