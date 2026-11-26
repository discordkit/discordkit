import type { ReactElement, ReactNode } from "react";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./SpoilerCover.module.css";

export interface SpoilerCoverProps {
  children: ReactNode;
  /** Extra classes for the cover, so it can take the place of the box it covers (a thumbnail's fixed size, say). */
  className?: string;
  /** What an inspecting tool asked for on the covered component's outermost element, which the cover now is (see `Inspect.ts`). */
  inspect?: Readonly<Record<`data-${string}`, string>>;
}

/**
 * A component marked `spoiler` (a container, a thumbnail or a file): blurred over the hidden spoiler colour, with a "Spoiler" pill in its middle, until it is clicked. Hidden by default, as a posted message shows it; a scene with `revealSpoilers` draws it revealed.
 *
 * The click needs no script, as for a text spoiler and a gallery item: the cover is a label around a visually hidden checkbox, and the stylesheet lifts the blur when the box is checked.
 */
export const SpoilerCover = ({
  children,
  className,
  inspect
}: SpoilerCoverProps): ReactElement => {
  const { revealSpoilers } = useSceneSettings();
  return (
    <label
      className={
        className === undefined
          ? styles.spoiler
          : `${styles.spoiler} ${className}`
      }
      {...inspect}
    >
      <input
        className={styles.toggle}
        type="checkbox"
        aria-label="Spoiler"
        defaultChecked={revealSpoilers}
      />
      <div className={styles.content}>{children}</div>
      <span className={styles.warning}>Spoiler</span>
    </label>
  );
};
