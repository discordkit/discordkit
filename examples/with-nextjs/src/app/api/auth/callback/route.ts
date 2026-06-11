import { authHandler } from "#src/lib/discord";

// Discord redirects back here with `code` + `state`. The handler verifies the
// state (CSRF), exchanges the code (with PKCE) for tokens, runs our `onSuccess`
// to seal them into the session cookie, clears the transient flow cookies, and
// redirects to `successRedirect`.
export const GET = authHandler.callback;
