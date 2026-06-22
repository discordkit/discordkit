import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";

/**
 * Bindings for `discordpp::AuthorizationCodeVerifier` (`Discord_AuthorizationCodeVerifier_*`) plus the client-level `CreateAuthorizationCodeVerifier` that produces one. The verifier carries both halves of the PKCE pair: the **challenge** (a handle passed into `AuthorizationArgs`) and the **verifier** string (passed later to `GetToken`).
 *
 * The challenge is an opaque `AuthorizationCodeChallenge` handle here — we read it off the verifier and pass it through; we don't call its own setters (custom PKCE), so it has no bindings file of its own yet.
 */
const bindings = defineBindings({
  create: /* C */ `void Discord_Client_CreateAuthorizationCodeVerifier(void *self, void *returnValue)`,
  challenge: /* C */ `void Discord_AuthorizationCodeVerifier_Challenge(void *self, void *returnValue)`,
  verifier: /* C */ `void Discord_AuthorizationCodeVerifier_Verifier(void *self, Discord_String *returnValue)`
});

/** The PKCE pair read out of a verifier: the challenge handle + verifier string. */
export interface PkcePair {
  /** Opaque `AuthorizationCodeChallenge` handle — pass to `AuthorizationArgs`. */
  challenge: FfiOpaque;
  /** The verifier string — pass to `GetToken` to complete the exchange. */
  verifier: string;
}

/**
 * Create a PKCE verifier for the client and read out both halves. The SDK owns the verifier handle's lifetime here (created via the client), so this returns plain values, not a disposable.
 */
export const createPkcePair = (
  lib: FfiLibrary,
  clientHandle: FfiOpaque
): PkcePair => {
  const b = bindings(lib);

  const verifierHandle = lib.allocHandle();
  b.create(clientHandle, verifierHandle);

  const challenge = lib.allocHandle();
  b.challenge(verifierHandle, challenge);

  const verifierOut = lib.allocStringOut();
  b.verifier(verifierHandle, verifierOut);

  return { challenge, verifier: lib.decodeString(verifierOut) };
};
