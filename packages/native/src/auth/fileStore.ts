/* eslint-disable require-await --
   The store's methods are `async` to satisfy the async `TokenStore` seam (other
   backends may be genuinely async, e.g. a network vault), but node:fs/crypto here
   are synchronous, so the bodies have no `await`. */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync
} from "node:crypto";
import { hostname, homedir, userInfo } from "node:os";
import { join } from "node:path";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync
} from "node:fs";
import type { StoredTokens, TokenStore } from "./tokenStore.js";

/**
 * A {@link TokenStore} that persists tokens to an encrypted file — a pure-Node
 * backend (no native addon), so it works anywhere the runtime does, including a
 * Node SEA sidecar where loading an extra native addon (the OS-keychain backend)
 * is impractical.
 *
 * Tokens are sealed with AES-256-GCM. The key is derived (scrypt) from a
 * machine-stable identifier + a per-app salt, so the file can't be lifted to
 * another machine and decrypted. This is **encrypted-at-rest, not vault-grade**:
 * the key is reconstructible on the same machine/user, so it deters casual file
 * theft but isn't the hardware-backed protection of the OS keychain. For hosts
 * that can load native addons (Electron, plain Node), prefer
 * `@discordkit/native/auth/keyring`.
 *
 * @param appId a stable id for your app (namespaces the file + salt).
 * @param dir override the storage directory (defaults to the OS app-data dir).
 */
export const fileStore = (appId: string, dir?: string): TokenStore => {
  const baseDir = dir ?? join(appDataDir(), appId);
  const file = join(baseDir, `discord-tokens.enc`);
  const key = deriveKey(appId);

  return {
    load: async () => {
      if (!existsSync(file)) return undefined;
      try {
        const sealed = readFileSync(file);
        return JSON.parse(open(sealed, key)) as StoredTokens;
      } catch {
        // Unreadable (corrupt, or key changed because the machine/user changed) —
        // treat as "nothing stored" so the flow re-authorizes cleanly.
        return undefined;
      }
    },
    save: async (tokens: StoredTokens) => {
      mkdirSync(baseDir, { recursive: true });
      writeFileSync(file, seal(JSON.stringify(tokens), key), { mode: 0o600 });
    },
    clear: async () => {
      rmSync(file, { force: true });
    }
  };
};

/** AES-256-GCM seal: `iv(12) | authTag(16) | ciphertext`. */
const seal = (plaintext: string, key: Buffer): Buffer => {
  const iv = randomBytes(12);
  const cipher = createCipheriv(`aes-256-gcm`, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, `utf8`),
    cipher.final()
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
};

const open = (sealed: Buffer, key: Buffer): string => {
  const iv = sealed.subarray(0, 12);
  const authTag = sealed.subarray(12, 28);
  const ciphertext = sealed.subarray(28);
  const decipher = createDecipheriv(`aes-256-gcm`, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString(`utf8`);
};

/** Derive a 32-byte key from a machine+user-stable seed (scrypt). */
const deriveKey = (appId: string): Buffer => {
  const seed = `${hostname()}:${userInfo().username}:${appId}`;
  // A fixed app salt — the per-machine seed is what scopes the key, not secrecy
  // of the salt (which can't be secret in a self-contained client anyway).
  return scryptSync(seed, `discordkit.token-store.v1`, 32);
};

/** The OS per-user application-data directory. */
const appDataDir = (): string => {
  if (process.platform === `win32`) {
    return process.env.APPDATA ?? join(homedir(), `AppData`, `Roaming`);
  }
  if (process.platform === `darwin`) {
    return join(homedir(), `Library`, `Application Support`);
  }
  return process.env.XDG_DATA_HOME ?? join(homedir(), `.local`, `share`);
};
