import type { ReactElement } from "react";
import { CheckIcon } from "./icons.js";
import styles from "./AppTag.module.css";

export interface AppTagProps {
  /** A verified app's tag starts with a check mark. */
  verified: boolean;
}

/** The "APP" tag Discord puts after an app's name in a message header. */
export const AppTag = ({ verified }: AppTagProps): ReactElement => (
  <span className={styles.tag}>
    {verified ? <CheckIcon className={styles.verified} /> : null}
    <span className={styles.text}>App</span>
  </span>
);
