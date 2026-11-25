import { useEffect, useState, type ReactElement } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import { CheckIcon, CopyIcon } from "./icons.js";
import styles from "./Buttons.module.css";

type StudioButtonProps = Omit<ButtonProps, `className` | `style`>;

/** The everyday button: bordered and neutral. */
export const QuietButton = (props: StudioButtonProps): ReactElement => (
  <Button {...props} className={styles.quiet} />
);

/** The one action a panel asks for, filled with the accent colour. */
export const PrimaryButton = (props: StudioButtonProps): ReactElement => (
  <Button {...props} className={styles.primary} />
);

/** How long "Copied" stays up after a copy. */
const confirmMs = 1500;

/**
 * Copies `text`, and says so: a clipboard write is otherwise invisible, so a person cannot tell a copy from a dead button. The clipboard can refuse (an insecure origin, a denied permission); the button then says it could not.
 */
export const CopyButton = ({
  text,
  label
}: {
  text: string;
  /** What is copied, for the accessible name: "Copy TypeScript". */
  label: string;
}): ReactElement => {
  const [outcome, setOutcome] = useState<`copied` | `failed`>();
  useEffect(() => {
    if (outcome === undefined) return;
    const timer = setTimeout(() => setOutcome(undefined), confirmMs);
    return (): void => clearTimeout(timer);
  }, [outcome]);
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setOutcome(`copied`);
    } catch {
      setOutcome(`failed`);
    }
  };
  return (
    <Button
      className={styles.quiet}
      aria-label={label}
      onPress={() => void copy()}
    >
      {outcome === `copied` ? (
        <CheckIcon className={styles.icon} />
      ) : (
        <CopyIcon className={styles.icon} />
      )}
      <span aria-live="polite">
        {outcome === `copied`
          ? `Copied`
          : outcome === `failed`
            ? `Could not copy`
            : `Copy`}
      </span>
    </Button>
  );
};
