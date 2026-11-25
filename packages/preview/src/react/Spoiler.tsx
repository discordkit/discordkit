import type { ReactElement, ReactNode } from "react";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Spoiler.module.css";

/**
 * `||spoiler||`: a bar over the text until it is clicked. Hidden by default, as a posted message shows it; a scene with `revealSpoilers` draws it revealed.
 *
 * The click needs no script, so a static render still works in a browser: the bar is a label around a visually hidden checkbox, and the stylesheet reveals the text when the box is checked. That pattern is from Mirrordown's spoiler plugin (MIT, same author); the colours and radius are Discord's.
 */
export const Spoiler = ({
  children
}: {
  children: ReactNode;
}): ReactElement => {
  const { revealSpoilers } = useSceneSettings();
  return (
    <label className={styles.spoiler}>
      <input
        className={styles.toggle}
        type="checkbox"
        aria-label="Spoiler"
        defaultChecked={revealSpoilers}
      />
      <span className={styles.content}>{children}</span>
    </label>
  );
};
