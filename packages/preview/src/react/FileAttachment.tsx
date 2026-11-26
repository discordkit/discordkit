import type { ReactElement } from "react";
import type { File as FileComponent } from "@discordkit/client/components/types/File";
import { formatFileSize } from "../format/fileSize.js";
import { FileIcon } from "./icons.js";
import { useInspect } from "./Inspect.js";
import { useSceneSettings } from "./SceneContext.js";
import { SpoilerCover } from "./SpoilerCover.js";
import styles from "./FileAttachment.module.css";

export interface FileAttachmentProps {
  /** A File component. `name` and `size` are optional here: a request leaves them out and Discord fills them in on the message it returns. */
  component: Omit<FileComponent, `name` | `size`> & {
    name?: string;
    size?: number;
  };
}

const attachmentPrefix = `attachment://`;

/** The file's name as the reference names it: what follows `attachment://`, or the last part of any other URL. */
const nameFromReference = (url: string): string =>
  url.startsWith(attachmentPrefix)
    ? url.slice(attachmentPrefix.length)
    : (url.split(/[?#]/)[0].split(`/`).at(-1) ?? url);

/**
 * A File component: the uploaded file as Discord draws an attachment that is not a picture, a bordered row with a file icon, the file's name as a link, and its size under it.
 *
 * The name is the payload's `name` when it has one (Discord's responses do), otherwise the `attachment://` reference's. The size is the payload's `size`, otherwise the scene's attachment entry's `size`; when neither gives one, only the name is drawn, since the preview cannot know what Discord would show.
 */
export const FileAttachment = ({
  component
}: FileAttachmentProps): ReactElement => {
  const { context } = useSceneSettings();
  const inspect = useInspect(component);
  const referenced = nameFromReference(component.file.url);
  const name = component.name ?? referenced;
  const size = component.size ?? context?.attachments?.[referenced]?.size;
  const row = (
    <div className={styles.file}>
      <FileIcon className={styles.icon} />
      <div className={styles.fileInner}>
        <div className={styles.filenameLinkWrapper}>
          <a className={styles.fileNameLink} href={`#${name}`}>
            {name}
          </a>
        </div>
        {size === undefined ? null : (
          <div className={styles.metadata}>{formatFileSize(size)}</div>
        )}
      </div>
    </div>
  );
  return (
    <div className={styles.fileWrapper} {...inspect}>
      {component.spoiler === true ? <SpoilerCover>{row}</SpoilerCover> : row}
    </div>
  );
};
