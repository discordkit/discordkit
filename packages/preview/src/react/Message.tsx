import type { ReactElement } from "react";
import { resolveAuthor } from "../format/resolve.js";
import { formatMessageTime } from "../format/timestamp.js";
import type { SceneMessage } from "../scene.js";
import { AppTag } from "./AppTag.js";
import { EyeIcon } from "./icons.js";
import { Image } from "./Image.js";
import { MessageComponents } from "./MessageComponents.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Message.module.css";

export interface MessageProps {
  message: SceneMessage;
  /** When the message was sent, in milliseconds since the epoch. */
  sentAt: number;
  /** The first message of a group: drawn with the avatar and the header. A message that continues the group above it is drawn as its body alone. */
  groupStart: boolean;
}

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

/**
 * One message as a channel shows it at Discord's default ("cozy") density: the author's avatar in the gutter, a header with their name, the app tag and the time, then the message's components.
 */
export const Message = ({
  message,
  sentAt,
  groupStart
}: MessageProps): ReactElement => {
  const { context, clock } = useSceneSettings();
  const author = resolveAuthor(message.author, context);
  const className = [
    styles.message,
    groupStart ? styles.groupStart : ``,
    message.ephemeral ? styles.ephemeral : ``
  ]
    .filter(Boolean)
    .join(` `);
  return (
    <div className={className}>
      {groupStart ? (
        <>
          <Image reference={author.avatar} alt="" className={styles.avatar} />
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
      {message.edited ? (
        // A Components V2 message has no content, so the edited mark is the content line's only text. Where Discord places it for such a message is unverified.
        <div className={styles.content}>
          <span className={`${styles.timestamp} ${styles.timestampInline}`}>
            <span className={styles.edited}>(edited)</span>
          </span>
        </div>
      ) : null}
      <div className={styles.accessories}>
        <MessageComponents payload={message.payload} />
      </div>
      {message.ephemeral ? <EphemeralNotice /> : null}
    </div>
  );
};
