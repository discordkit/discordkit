import { useMemo, type ReactElement } from "react";
import { isComponentsV2 } from "../components.js";
import { resolveAuthor } from "../format/resolve.js";
import { formatMessageTime } from "../format/timestamp.js";
import { parseMarkdown } from "../markdown/parse.js";
import type { SceneMessage } from "../scene.js";
import { AppTag } from "./AppTag.js";
import { ClassicComponents } from "./ClassicComponents.js";
import { DefaultAvatar } from "./DefaultAvatar.js";
import { Embed } from "./Embed.js";
import { EyeIcon } from "./icons.js";
import { Image } from "./Image.js";
import { useInspect } from "./Inspect.js";
import { Markup } from "./Markup.js";
import { MessageComponents } from "./MessageComponents.js";
import {
  OpenSelectContext,
  openSelectAnchor,
  openStringSelect
} from "./OpenSelect.js";
import { useSceneSettings } from "./SceneContext.js";
import { SelectPopout } from "./SelectPopout.js";
import styles from "./Message.module.css";

export interface MessageProps {
  message: SceneMessage;
  /** When the message was sent, in milliseconds since the epoch. */
  sentAt: number;
  /** The first message of a group: drawn with the avatar and the header. A message that continues the group above it is drawn as its body alone. */
  groupStart: boolean;
  /** Its place in the scene, for error messages. */
  index: number;
}

// Shared with lint, which has to decide the same thing without React.
export { isComponentsV2 };

/** The line under an ephemeral reply. */
const EphemeralNotice = (): ReactElement => (
  <div className={styles.ephemeralNotice}>
    <EyeIcon className={styles.ephemeralIcon} />
    {`Only you can see this • `}
    <a className={styles.dismiss} href="#dismiss">
      Dismiss message
    </a>
  </div>
);

const EditedMark = (): ReactElement => (
  <span className={`${styles.timestamp} ${styles.timestampInline}`}>
    <span className={styles.edited}>(edited)</span>
  </span>
);

/** A Components V2 message's body. It has no content line, so the edited mark gets one of its own. */
const ComponentsBody = ({
  message,
  index
}: {
  message: SceneMessage;
  index: number;
}): ReactElement => {
  const { content, embeds = [], components = [] } = message.payload;
  if ((content ?? ``) !== `` || embeds.length > 0) {
    throw new Error(
      `@discordkit/preview cannot draw message ${String(index + 1)}: it is a Components V2 message (it has the IS_COMPONENTS_V2 flag or a layout component) but also has ${(content ?? ``) === `` ? `embeds` : `content`}. Discord refuses to send a V2 message with \`content\` or \`embeds\`, so no real message looks like this. Move the text into a Text Display, or drop the flag and the layout components to send a classic message.`
    );
  }
  return (
    <>
      {message.edited ? (
        // Where Discord places the edited mark on a Components V2 message is unverified.
        <div className={styles.content}>
          <EditedMark />
        </div>
      ) : null}
      <div className={styles.accessories}>
        <MessageComponents components={components} />
      </div>
    </>
  );
};

/** A classic message's body: its content with the edited mark at the end of it, then its embeds and its rows of buttons. */
const ClassicBody = ({ message }: { message: SceneMessage }): ReactElement => {
  const { content = ``, embeds = [], components = [] } = message.payload;
  const hasContent = content !== `` || message.edited === true;
  return (
    <>
      {hasContent ? (
        <div className={styles.content}>
          <Markup nodes={parseMarkdown(content, `message`)} />
          {message.edited ? <EditedMark /> : null}
        </div>
      ) : null}
      {embeds.length > 0 || components.length > 0 ? (
        <div className={styles.accessories}>
          {embeds.map((embed, position) => (
            // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; embeds have no key of their own.
            <Embed key={position} embed={embed} index={position} />
          ))}
          {components.length > 0 ? (
            <ClassicComponents components={components} />
          ) : null}
        </div>
      ) : null}
    </>
  );
};

/**
 * One message as a channel shows it at Discord's default ("cozy") density: the author's avatar in the gutter, a header with their name, the app tag and the time, then the message's body, which is either its Components V2 components or its classic content, embeds and buttons.
 */
export const Message = ({
  message,
  sentAt,
  groupStart,
  index
}: MessageProps): ReactElement => {
  const { context, clock } = useSceneSettings();
  const author = resolveAuthor(message.author, context);
  const inspect = useInspect(message);
  const openSelect = useMemo(() => {
    if (message.openSelect === undefined) return null;
    const select = openStringSelect(
      message.payload.components,
      message.openSelect,
      index
    );
    if (select instanceof Error) throw select;
    return {
      select,
      context: {
        customId: message.openSelect,
        anchorName: openSelectAnchor(index)
      }
    };
  }, [message.openSelect, message.payload.components, index]);
  const className = [
    styles.message,
    groupStart ? styles.groupStart : ``,
    message.ephemeral ? styles.ephemeral : ``
  ]
    .filter(Boolean)
    .join(` `);
  return (
    <div className={className} {...inspect}>
      {groupStart ? (
        <>
          {author.avatar === undefined ? (
            <DefaultAvatar avatar={author.fallback} className={styles.avatar} />
          ) : (
            <Image reference={author.avatar} alt="" className={styles.avatar} />
          )}
          <h3 className={styles.header}>
            <span className={styles.headerText}>
              <span className={styles.username}>{author.name}</span>
              {author.bot ? (
                <AppTag verified={author.verified ?? false} />
              ) : null}
            </span>
            <span className={`${styles.timestamp} ${styles.timestampInline}`}>
              <time dateTime={new Date(sentAt).toISOString()}>
                {formatMessageTime(sentAt, clock)}
              </time>
            </span>
          </h3>
        </>
      ) : null}
      <OpenSelectContext value={openSelect?.context ?? null}>
        {isComponentsV2(message.payload) ? (
          <ComponentsBody message={message} index={index} />
        ) : (
          <ClassicBody message={message} />
        )}
      </OpenSelectContext>
      {message.ephemeral ? <EphemeralNotice /> : null}
      {openSelect ? (
        <SelectPopout
          select={openSelect.select}
          anchorName={openSelect.context.anchorName}
        />
      ) : null}
    </div>
  );
};
