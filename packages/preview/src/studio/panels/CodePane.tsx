import type { ReactElement } from "react";
import { CopyButton } from "../controls/Buttons.js";
import styles from "./CodePane.module.css";

/** The TypeScript `codegen` writes for the file: what to paste into a bot. */
export const CodePane = ({
  source
}: {
  source: string | undefined;
}): ReactElement => (
  <div className={styles.pane}>
    <div className={styles.header}>
      <p className={styles.caption}>
        Typed against <code>@discordkit/client</code>, as{" "}
        <code>discordkit-preview codegen</code>
        {` `}
        prints it.
      </p>
      {source === undefined ? null : (
        <CopyButton text={source} label="Copy TypeScript" />
      )}
    </div>
    {source === undefined ? (
      <p className={styles.empty}>
        There is no code to show, because the JSON cannot be read as a message.
        The findings say why.
      </p>
    ) : (
      // Chromium and Firefox make a scrolling box like this keyboard-focusable themselves, so it needs no tabIndex.
      <pre className={styles.code} aria-label="Generated TypeScript">
        <code>{source}</code>
      </pre>
    )}
  </div>
);
