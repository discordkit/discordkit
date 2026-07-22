import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Per-platform Discord Social SDK shared-library file name.
 *
 * From the SDK archive layout (verified against 1.9.17379): Windows ships
 * `discord_partner_sdk.dll` under `bin/release`; macOS/Linux ship
 * `libdiscord_partner_sdk.{dylib,so}` under `lib/release`. ARM64 builds live in
 * an `arm64/` subdirectory of those. The layout is stable across 1.9.x builds.
 */
const platformFile = (): string => {
  if (process.platform === `win32`) return `discord_partner_sdk.dll`;
  if (process.platform === `darwin`) return `libdiscord_partner_sdk.dylib`;
  return `libdiscord_partner_sdk.so`; // Linux + other glibc unixes
};

/** Subdirectory of the SDK root that holds the loadable library for this OS. */
const platformLibDir = (): string =>
  process.platform === `win32`
    ? join(`bin`, `release`)
    : join(`lib`, `release`);

/** Candidate file locations beneath an SDK root directory, most-specific first. */
const candidatesUnderRoot = (root: string): string[] => {
  const file = platformFile();
  const dir = platformLibDir();
  return [
    // arm64 builds nest one level deeper; x64 sits at the top of the release dir.
    ...(process.arch === `arm64` ? [join(root, dir, `arm64`, file)] : []),
    join(root, dir, file),
    // Some devs unzip so the lib sits directly in the configured dir.
    join(root, file)
  ];
};

/**
 * Conventional locations to probe when no explicit path is given. Relative to
 * the current working directory and the running executable, mirroring how the
 * SDK expects to be shipped (next to the binary, or under `lib/`).
 */
const conventionRoots = (): string[] => {
  const roots = [
    join(process.cwd(), `lib`, `discord_social_sdk`),
    join(process.cwd(), `discord_social_sdk`),
    dirname(process.execPath)
  ];
  return roots;
};

/** Options accepted by {@link resolveLibraryPath}. */
export interface ResolveLibraryOptions {
  /** Explicit path: either the SDK root directory or the library file itself. */
  libraryPath?: string;
}

/**
 * Resolve the absolute path of the Social SDK shared library to load.
 *
 * Resolution order (first hit wins):
 * 1. An explicit `libraryPath` — a direct file, or an SDK root we derive the
 *    per-platform file from.
 * 2. The `DISCORD_SDK_PATH` environment variable (same file-or-root handling).
 * 3. Conventional locations: `./lib/discord_social_sdk`, `./discord_social_sdk`,
 *    and next to the running executable.
 *
 * @throws if nothing resolves to an existing file — with the locations tried.
 */
export const resolveLibraryPath = (
  options: ResolveLibraryOptions = {}
): string => {
  const tried: string[] = [];

  const fromInput = (input: string | undefined): string | undefined => {
    if (!input) return undefined;
    // A direct file path: use as-is.
    if (existsSync(input) && statSync(input).isFile()) return input;
    // Otherwise treat as an SDK root and derive the platform file.
    for (const candidate of candidatesUnderRoot(input)) {
      tried.push(candidate);
      if (existsSync(candidate)) return candidate;
    }
    return undefined;
  };

  const explicit = fromInput(options.libraryPath);
  if (explicit) return explicit;

  const fromEnv = fromInput(process.env.DISCORD_SDK_PATH);
  if (fromEnv) return fromEnv;

  for (const root of conventionRoots()) {
    const found = fromInput(root);
    if (found) return found;
  }

  throw new Error(
    `Could not locate the Discord Social SDK library (${platformFile()}). ` +
      `The SDK can't be redistributed, so you must download it from the ` +
      `Developer Portal and either pass \`libraryPath\` to init/createClient, ` +
      `set DISCORD_SDK_PATH, or place it at ./lib/discord_social_sdk. ` +
      `Locations checked: ${tried.join(`, `) || `(none)`}.`
  );
};
