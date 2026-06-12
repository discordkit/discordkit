import { createAuthClient } from "better-auth/react";

/**
 * The browser-side Better Auth client. Exposes `signIn.social`, `signOut`, and
 * the `useSession` React hook used by the UI. Talks to the `/api/auth/*` routes
 * mounted in `app/api/auth/[...all]/route.ts`.
 */
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
