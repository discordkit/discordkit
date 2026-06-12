"use client";
import React from "react";
import { signIn } from "#src/lib/auth-client";

/**
 * Discord login. Better Auth owns the OAuth flow, so login is a client call
 * (`signIn.social`) rather than a link to our own redirect route — Better Auth
 * redirects the browser to Discord and handles the callback at
 * `/api/auth/callback/discord`, landing on `/dashboard` (callbackURL).
 */
export const LoginButton: React.FC = () => (
  <button
    type="button"
    onClick={() => {
      void signIn.social({ provider: `discord`, callbackURL: `/dashboard` });
    }}
    className="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#4752c4]"
  >
    {`Login with Discord`}
  </button>
);
