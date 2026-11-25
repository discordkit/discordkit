import type { ReactElement, ReactNode } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { PartialEmoji } from "./PartialEmoji.js";
import styles from "./ButtonBase.module.css";

export interface ButtonBaseProps {
  button: Button;
  /** The style's colours: a class from the style's own stylesheet. */
  colorClassName: string;
  /** Drawn in place of the payload's label, for a style whose text the client supplies (Premium). */
  label?: string;
  /** Drawn before the emoji and label, such as a Premium button's shop icon. */
  leading?: ReactNode;
  /** Drawn after the label, such as a Link button's external-link mark. */
  trailing?: ReactNode;
}

/**
 * What every message button shares: Discord's 32px box, an optional emoji, a label cut to one line, and the disabled state. Each button style is its own component around this, so the style's colours live with it.
 */
export const ButtonBase = ({
  button,
  colorClassName,
  label = button.label,
  leading,
  trailing
}: ButtonBaseProps): ReactElement => {
  const hasLabel = label !== undefined && label !== ``;
  return (
    <button
      type="button"
      className={`${styles.button} ${colorClassName}`}
      disabled={button.disabled ?? false}
      // A button with only an emoji is named by the emoji, as a screen reader would read it.
      aria-label={hasLabel ? undefined : (button.emoji?.name ?? undefined)}
    >
      <div className={styles.contents}>
        <div className={styles.content}>
          {leading}
          {button.emoji ? (
            <span
              className={
                hasLabel ? `${styles.emoji} ${styles.textEmoji}` : styles.emoji
              }
            >
              <PartialEmoji emoji={button.emoji} />
            </span>
          ) : null}
          {hasLabel ? <span className={styles.label}>{label}</span> : null}
          {trailing}
        </div>
      </div>
    </button>
  );
};
