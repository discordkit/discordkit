import type { ReactElement } from "react";
import type { FileUpload as FileUploadComponent } from "@discordkit/client/components/types/FileUpload";
import { formatFileSize } from "../format/fileSize.js";
import { CloseIcon, FileIcon, UploadIcon } from "./icons.js";
import { useInspect } from "./Inspect.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./FileUpload.module.css";

export interface FileUploadProps {
  upload: FileUploadComponent;
  /** The uploaded files' names, from the scene's `values`. A file the scene's `context.attachments` lists shows its size. */
  files: readonly string[] | undefined;
}

/**
 * A File Upload: the drop area, with an icon, "Drop files here or browse" and how many files it takes, and under it, once files are added, a card for each with its icon, name and size.
 *
 * Unverified: the wording, which the client decides; the limit line, which Discord's screenshot shows as "Upload up to 10 files under 500 MB." and whose size depends on the person's upload limit, so the preview writes only the count; and that the drop area stays above the cards once files are added.
 */
export const FileUpload = ({
  upload,
  files
}: FileUploadProps): ReactElement => {
  const { context } = useSceneSettings();
  const most = upload.maxValues ?? 1;
  return (
    <div className={styles.container} {...useInspect(upload)}>
      <div className={styles.main}>
        <UploadIcon className={styles.icon} />
        <div className={styles.prompt}>
          {`Drop files here or `}
          <span className={styles.browse}>browse</span>
        </div>
        <div className={styles.limit}>
          {most === 1
            ? `Upload 1 file.`
            : `Upload up to ${String(most)} files.`}
        </div>
      </div>
      {files === undefined || files.length === 0 ? null : (
        <div className={styles.files}>
          {files.map((name) => {
            const size = context?.attachments?.[name]?.size;
            return (
              <div key={name} className={styles.file}>
                <FileIcon className={styles.fileIcon} />
                <div className={styles.fileText}>
                  <div className={styles.fileName}>{name}</div>
                  {size === undefined ? null : (
                    <div className={styles.fileSize}>
                      {formatFileSize(size)}
                    </div>
                  )}
                </div>
                <span className={styles.remove} aria-hidden="true">
                  <CloseIcon className={styles.removeIcon} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
