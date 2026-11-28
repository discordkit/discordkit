import type { ReactElement } from "react";
import type { TextInput } from "@discordkit/client/components/types/TextInput";
import { characters } from "../lint/limits.js";
import { useInspect } from "./Inspect.js";
import styles from "./TextInput.module.css";

export interface ParagraphTextInputProps {
  input: TextInput;
  /** What has been typed, from the scene's `values`; without it, the payload's `value`, else the placeholder. */
  text: string | undefined;
}

/**
 * A multi-line Text Input (`TextInputStyle.Paragraph`): at least two lines tall, growing with what is typed, with its line breaks kept. With a `maxLength`, a counter in the bottom corner shows how many characters are left, in the error colour once the text is over.
 *
 * Unverified, as the client decides them in JavaScript: that the box grows with its text rather than scrolling, how tall it starts (two lines, which is what Discord's screenshots show for an empty one), that the counter counts down, and that it appears only with a `maxLength`.
 */
export const ParagraphTextInput = ({
  input,
  text = input.value
}: ParagraphTextInputProps): ReactElement => {
  const used = characters(text ?? ``);
  const left =
    input.maxLength === undefined ? undefined : input.maxLength - used;
  return (
    <div
      className={`${styles.box} ${styles.paragraph} ${left === undefined ? `` : styles.counted}`}
      {...useInspect(input)}
    >
      {text === undefined || text === `` ? (
        <span className={styles.placeholder}>{input.placeholder ?? ``}</span>
      ) : (
        <span className={styles.lines}>{text}</span>
      )}
      {left === undefined ? null : (
        <span
          className={`${styles.counter} ${left < 0 ? styles.overflow : ``}`}
        >
          {String(left)}
        </span>
      )}
    </div>
  );
};
