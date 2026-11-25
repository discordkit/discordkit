import type { GuildNavigationTarget } from "../markdown/ast.js";
import type { SceneContext, SceneUser } from "../scene.js";
import { colorToHex } from "./color.js";

/**
 * What ids in a message resolve to, looked up in the scene's context. An id the context does not list resolves to what the Discord client shows for an id it cannot find. Those fallback words are decided in the client's JavaScript, so they are unverified until calibration.
 */

/** A user mention's text. */
export const userMentionLabel = (
  id: string,
  context: SceneContext | undefined
): string => `@${context?.users?.[id]?.name ?? `unknown-user`}`;

export interface RoleMention {
  label: string;
  /** The role's colour as `#rrggbb`, or `undefined` for a role with no colour, whose mention uses the default mention colours. */
  color?: string;
}

export const roleMention = (
  id: string,
  context: SceneContext | undefined
): RoleMention => {
  const role = context?.roles?.[id];
  if (!role) return { label: `@deleted-role` };
  // Discord stores "no colour" as 0, so black cannot be a role colour and 0 is an absence here.
  return role.color
    ? { label: `@${role.name}`, color: colorToHex(role.color) }
    : { label: `@${role.name}` };
};

/** A channel mention's name, without the `#`, which is drawn as an icon. */
export const channelMentionLabel = (
  id: string,
  context: SceneContext | undefined
): string => context?.channels?.[id]?.name ?? `unknown`;

/** What a guild navigation link is called: the name of the page it opens. */
export const guildNavigationLabels = {
  customize: `Channels & Roles`,
  browse: `Browse Channels`,
  guide: `Server Guide`,
  "linked-roles": `Linked Roles`
} as const satisfies Record<GuildNavigationTarget, string>;

/** The author a message is drawn as when it names none. */
export const defaultAuthor: SceneUser = { name: `App`, bot: true };

/**
 * The background colours a drawn default avatar picks from. Ours, not Discord's: muted enough to sit in any of the four themes, and dark enough for a white initial to read on each.
 */
export const defaultAvatarColors = [
  `#4f6d7a`,
  `#7a5c4f`,
  `#5c7a4f`,
  `#6b4f7a`,
  `#7a4f5c`,
  `#4f5c7a`
] as const;

/** A small, stable string hash (32-bit FNV-1a), so the same key always picks the same colour on every machine. */
const hash = (text: string): number => {
  let value = 0x81_1c_9d_c5;
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01_00_01_93) >>> 0;
  }
  return value;
};

export interface DefaultAvatar {
  /** The first character of the name as a reader sees it (one grapheme), upper-cased. */
  initial: string;
  color: (typeof defaultAvatarColors)[number];
}

/**
 * What a user with no picture is drawn with: a coloured circle with their name's initial. Discord would show one of its own default avatars, fetched from its CDN; this is drawn locally instead, so a scene that sets no avatars renders with no network at all and the image carries no Discord logo. The colour is chosen from `key` (the user's id when there is one), so a user keeps their colour from scene to scene.
 */
export const defaultAvatar = (key: string, name: string): DefaultAvatar => {
  const first = new Intl.Segmenter(`en`, { granularity: `grapheme` })
    .segment(name.trim())
    [Symbol.iterator]()
    .next();
  return {
    initial: first.done ? `?` : first.value.segment.toLocaleUpperCase(`en`),
    color: defaultAvatarColors[hash(key) % defaultAvatarColors.length]
  };
};

export interface ResolvedAuthor extends SceneUser {
  /** Drawn when the user has no `avatar`. */
  fallback: DefaultAvatar;
}

/** The user a message is drawn as: the entry `author` names, or the default app when it names none, with the drawn avatar to use if the user has no picture. */
export const resolveAuthor = (
  author: string | undefined,
  context: SceneContext | undefined
): ResolvedAuthor => {
  const user =
    (author === undefined ? undefined : context?.users?.[author]) ??
    (author === undefined ? defaultAuthor : { name: `unknown-user` });
  return { ...user, fallback: defaultAvatar(author ?? user.name, user.name) };
};
