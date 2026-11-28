import { useId, useMemo, type ReactElement } from "react";
import { resolveAuthor } from "../format/resolve.js";
import type { SceneModal } from "../scene.js";
import { DefaultAvatar } from "./DefaultAvatar.js";
import { CloseIcon, WarningIcon } from "./icons.js";
import { Image } from "./Image.js";
import { useInspect } from "./Inspect.js";
import { ModalComponents } from "./ModalComponents.js";
import { ModalContext } from "./ModalContext.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Modal.module.css";

export interface ModalProps {
  modal: SceneModal;
}

/**
 * A modal open over the channel: the dimmed chat behind it, and the dialog with the app's avatar and the modal's title, the client's warning that the form goes to the app, the modal's components, and Cancel and Submit. Drawn as it opens (empty, but for what the payload fills in), or with the scene's `values` filled in and, after `submitted`, the errors the client shows.
 */
export const Modal = ({ modal }: ModalProps): ReactElement => {
  const { context } = useSceneSettings();
  const author = resolveAuthor(modal.author, context);
  const titleId = useId();
  const inspect = useInspect(modal.payload);
  const state = useMemo(
    () => ({ values: modal.values, submitted: modal.submitted === true }),
    [modal.values, modal.submitted]
  );
  return (
    <div className={styles.layer}>
      <div className={styles.backdrop} />
      <dialog
        className={styles.modal}
        open
        aria-labelledby={titleId}
        {...inspect}
      >
        <div className={styles.header}>
          {author.avatar === undefined ? (
            <DefaultAvatar
              avatar={author.fallback}
              className={styles.appIcon}
            />
          ) : (
            <Image
              reference={author.avatar}
              alt=""
              className={styles.appIcon}
            />
          )}
          <h1 id={titleId} className={styles.title}>
            {modal.payload.title}
          </h1>
          <span className={styles.close}>
            <CloseIcon className={styles.closeIcon} />
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.notice}>
            <WarningIcon className={styles.noticeIcon} />
            <span className={styles.noticeText}>
              {`This form will be submitted to `}
              <strong className={styles.appName}>{author.name}</strong>
              {`. Do not share passwords or other sensitive information.`}
            </span>
          </div>
          <ModalContext value={state}>
            <ModalComponents components={modal.payload.components} />
          </ModalContext>
        </div>
        <div className={styles.footer}>
          <button type="button" className={`${styles.button} ${styles.cancel}`}>
            Cancel
          </button>
          <button type="button" className={`${styles.button} ${styles.submit}`}>
            Submit
          </button>
        </div>
      </dialog>
    </div>
  );
};
