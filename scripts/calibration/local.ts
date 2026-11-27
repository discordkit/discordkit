/**
 * Where the calibration kit keeps what is private to the owner, and the checks that keep it out of the repository.
 *
 * The manifest of what was posted (channel and message ids) and the screenshots are private, so both live under `.discord-reference/`, which git ignores. Nothing is written until git has said the destination is ignored.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

/** The repository's root, as git reports it from `cwd`. Throws, saying what to do, outside a repository. */
export const repositoryRoot = (cwd: string = process.cwd()): string => {
  try {
    return execFileSync(`git`, [`rev-parse`, `--show-toplevel`], {
      cwd,
      encoding: `utf8`,
      stdio: [`ignore`, `pipe`, `pipe`]
    }).trim();
  } catch {
    throw new Error(
      `The calibration kit could not find the repository it is run from: \`git rev-parse --show-toplevel\` failed in ${cwd}. It keeps manifests and screenshots in the repository's ignored .discord-reference/ folder, so it needs to know where that is. Run it from inside the discordkit checkout.`
    );
  }
};

/**
 * Whether git ignores `path`, asked of the repository that holds it. False when git does not ignore it, when it is tracked, and when it is in no repository at all, since then nothing vouches for it.
 */
export const isIgnored = (path: string): boolean => {
  const absolute = resolve(path);
  // Ask from the nearest folder that exists: git needs a working directory inside the repository, and the path itself may be a file or not exist yet.
  let directory = dirname(absolute);
  while (!existsSync(directory)) directory = dirname(directory);
  try {
    execFileSync(`git`, [`check-ignore`, `--quiet`, absolute], {
      cwd: directory,
      stdio: `ignore`
    });
    return true;
  } catch {
    return false;
  }
};

/** Throws, saying why and what to do, unless git ignores `path`. `what` names what would be written there. */
export const requireIgnored = (path: string, what: string): void => {
  if (isIgnored(path)) return;
  throw new Error(
    `The calibration kit will not write ${what} to ${path}, because git does not ignore that path, so it could end up committed. Screenshots and manifests of the owner's Discord are private. Choose a destination under the repository's .discord-reference/ folder, which .gitignore lists, or add the destination to .git/info/exclude first.`
  );
};

/** The default folder for manifests of what was posted. */
export const manifestFolder = (root: string): string =>
  join(root, `.discord-reference`, `posted`);

/** One message the kit posted. */
export interface ManifestEntry {
  /** The fixture's number and code. */
  fixture: number;
  code: string;
  kind: `label` | `message`;
  /** Which of the fixture's messages, from 0; null for the label. */
  index: number | null;
  channelId: string;
  messageId: string;
  sender: `bot` | `webhook`;
  postedAt: string;
  /** When it was edited, for a message posted and then edited. */
  editedAt?: string;
  /** When the delete command removed it. */
  deletedAt?: string;
}

export interface Manifest {
  version: 1;
  startedAt: string;
  channelId: string;
  /** The guild the channel is in, when the bot could read it. */
  guildId: string | null;
  /** The bot's user id and name, which the render's header needs. */
  bot: { id: string; username: string } | null;
  /** The webhook's id; never its token. */
  webhookId: string | null;
  /** The time zone and locale of the machine that posted, which timestamps in the client are drawn in if the owner's client runs there. */
  timeZone: string;
  locale: string;
  /** The fixtures this run was asked to post. */
  fixtures: number[];
  entries: ManifestEntry[];
}

export const writeManifest = (path: string, manifest: Manifest): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
};

export const readManifest = (path: string): Manifest => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, `utf8`));
  } catch (error) {
    throw new Error(
      `The calibration kit could not read the manifest ${path}: ${error instanceof Error ? error.message : String(error)}. A manifest is the JSON file the post command writes under .discord-reference/posted/. Pass one it wrote with --manifest, or leave --manifest out to use the latest.`,
      { cause: error }
    );
  }
  const manifest = parsed as Partial<Manifest> | null;
  if (manifest?.version !== 1 || !Array.isArray(manifest.entries)) {
    throw new Error(
      `${path} is not a manifest the calibration kit wrote: it has no \`version: 1\` and \`entries\` list. Pass a file from .discord-reference/posted/ with --manifest.`
    );
  }
  return manifest as Manifest;
};

/**
 * The newest manifest in `folder` that still lists a message not deleted, by name (they are named by the time they were started), or null when there is none. Each tier is its own post and its own manifest, so running the delete command once per post clears them all, newest first.
 */
export const latestManifest = (folder: string): string | null => {
  if (!existsSync(folder)) return null;
  const names = readdirSync(folder)
    .filter((name) => name.endsWith(`.json`))
    .sort()
    .reverse();
  const found = names.find((name) =>
    readManifest(join(folder, name)).entries.some((entry) => !entry.deletedAt)
  );
  return found === undefined ? null : join(folder, found);
};

/** A timestamp usable in a file name on every platform: `2026-11-27T12-00-00Z`. */
export const fileStamp = (date: Date): string =>
  date
    .toISOString()
    .replace(/\.\d+Z$/, `Z`)
    .replaceAll(`:`, `-`);

/** A path for printing: relative to the root when inside it. */
export const shown = (path: string, root: string): string => {
  const inside = relative(root, path);
  return inside.startsWith(`..`) ? path : inside.replaceAll(`\\`, `/`);
};
