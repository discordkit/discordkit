import { useMemo, type ReactElement } from "react";
import type {
  ChannelMentionNode,
  CommandMentionNode,
  GlobalMentionNode,
  GuildNavigationNode,
  RoleMentionNode,
  UserMentionNode
} from "../markdown/ast.js";
import {
  channelMentionLabel,
  guildNavigationLabels,
  roleMention,
  userMentionLabel
} from "../format/resolve.js";
import { HashIcon } from "./icons.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Mention.module.css";

/**
 * Mentions, each drawn as Discord's mention pill. The pill's shape and default colours come from the stylesheet; what each one says, and a role's colours, are decided in the client's JavaScript and follow what it shows.
 */

/** `<@id>`: the user's display name, or `@unknown-user`. */
export const UserMention = ({
  node
}: {
  node: UserMentionNode;
}): ReactElement => {
  const { context } = useSceneSettings();
  return (
    <span className={styles.mention}>{userMentionLabel(node.id, context)}</span>
  );
};

/** Splits `#rrggbb` into the channels CSS colour functions take. */
const rgb = (hex: string): string =>
  [1, 3, 5]
    .map((start) => Number.parseInt(hex.slice(start, start + 2), 16))
    .join(` `);

/** `<@&id>`: the role's name, in the role's colour on a 10% tint of it when the role has one. Discord sets those two colours inline from the role, so they are not in its stylesheet; unverified. */
export const RoleMention = ({
  node
}: {
  node: RoleMentionNode;
}): ReactElement => {
  const { context } = useSceneSettings();
  const { label, color } = roleMention(node.id, context);
  const style = useMemo(
    () =>
      color === undefined
        ? undefined
        : { color, backgroundColor: `rgb(${rgb(color)} / 0.1)` },
    [color]
  );
  return (
    <span className={`${styles.mention} ${styles.roleMention}`} style={style}>
      {label}
    </span>
  );
};

/** `<#id>`: a channel icon and the channel's name, or `unknown`. */
export const ChannelMention = ({
  node
}: {
  node: ChannelMentionNode;
}): ReactElement => {
  const { context } = useSceneSettings();
  return (
    <span className={`${styles.mention} ${styles.channelMention}`}>
      <HashIcon className={styles.channelIcon} />
      {channelMentionLabel(node.id, context)}
    </span>
  );
};

/** `@everyone` and `@here`. */
export const GlobalMention = ({
  node
}: {
  node: GlobalMentionNode;
}): ReactElement => <span className={styles.mention}>{`@${node.target}`}</span>;

/** `</name:id>`: the command as you would type it. */
export const CommandMention = ({
  node
}: {
  node: CommandMentionNode;
}): ReactElement => <span className={styles.mention}>{`/${node.name}`}</span>;

/** `<id:browse>` and the other server pages: the page's name. */
export const GuildNavigation = ({
  node
}: {
  node: GuildNavigationNode;
}): ReactElement => (
  <span className={styles.mention}>{guildNavigationLabels[node.target]}</span>
);
