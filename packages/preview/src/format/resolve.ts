import type { GuildNavigationTarget } from "../markdown/ast.js";
import type { SceneContext, SceneUser } from "../scene.js";

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

const toHex = (color: number): string =>
  `#${color.toString(16).padStart(6, `0`)}`;

export const roleMention = (
  id: string,
  context: SceneContext | undefined
): RoleMention => {
  const role = context?.roles?.[id];
  if (!role) return { label: `@deleted-role` };
  // Discord stores "no colour" as 0, so black cannot be a role colour and 0 is an absence here.
  return role.color
    ? { label: `@${role.name}`, color: toHex(role.color) }
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
 * Discord's default avatar for a user with none: one of six images, chosen from the id (`(id >> 22) % 6`, the rule for accounts on the current username system). An id that is not a snowflake gets the first.
 */
export const defaultAvatarUrl = (id: string | undefined): string => {
  let index = 0n;
  if (id !== undefined && /^\d+$/.test(id)) index = (BigInt(id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${String(index)}.png`;
};

export interface ResolvedAuthor extends SceneUser {
  avatar: string;
}

/** The user a message is drawn as: the entry `author` names, the default app when it names none, and the default avatar when the user has no picture. */
export const resolveAuthor = (
  author: string | undefined,
  context: SceneContext | undefined
): ResolvedAuthor => {
  const user =
    (author === undefined ? undefined : context?.users?.[author]) ??
    (author === undefined ? defaultAuthor : { name: `unknown-user` });
  return { ...user, avatar: user.avatar ?? defaultAvatarUrl(author) };
};
