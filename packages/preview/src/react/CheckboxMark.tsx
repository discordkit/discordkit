import type { ReactElement } from "react";
import { CheckIcon } from "./icons.js";
import styles from "./CheckboxMark.module.css";

export interface CheckboxMarkProps {
  ticked: boolean;
}

/** The 20px box of a checkbox, empty or filled with a tick: the part a Checkbox and each option of a Checkbox Group share. */
export const CheckboxMark = ({ ticked }: CheckboxMarkProps): ReactElement => (
  <span
    className={`${styles.box} ${ticked ? styles.ticked : ``}`}
    aria-hidden="true"
  >
    {ticked ? <CheckIcon className={styles.tick} /> : null}
  </span>
);
