import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "#src/lib/auth";

// Better Auth mounts its entire OAuth + session API under /api/auth/* via this
// single catch-all route: sign-in, the Discord callback
// (/api/auth/callback/discord), sign-out, session, get-access-token, etc.
export const { POST, GET } = toNextJsHandler(auth);
