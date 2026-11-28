import type { ReactElement } from "react";
import type { TextInput } from "@discordkit/client/components/types/TextInput";
import { useInspect } from "./Inspect.js";
import styles from "./TextInput.module.css";

export interface ShortTextInputProps {
  input: TextInput;
  /** What has been typed, from the scene's `values`; without it, the payload's `value`, else the placeholder. */
  text: string | undefined;
}

/** A single-line Text Input (`TextInputStyle.Short`): one line of text in the field box, cut at its end, or the placeholder in the placeholder colour. */
export const ShortTextInput = ({
  input,
  text = input.value
}: ShortTextInputProps): ReactElement => (
  <div className={`${styles.box} ${styles.short}`} {...useInspect(input)}>
    {text === undefined || text === `` ? (
      <span className={styles.placeholder}>{input.placeholder ?? ``}</span>
    ) : (
      <span className={styles.line}>{text}</span>
    )}
  </div>
);
