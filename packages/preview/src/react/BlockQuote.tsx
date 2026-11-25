import type { ReactElement, ReactNode } from "react";
import styles from "./BlockQuote.module.css";

/** `> quote` or `>>> quote`: the quoted text beside a rounded bar, as Discord lays it out (a flex row of the bar and the `blockquote`). */
export const BlockQuote = ({
  children
}: {
  children: ReactNode;
}): ReactElement => (
  <div className={styles.blockQuote}>
    <div className={styles.divider} />
    <blockquote className={styles.quote}>{children}</blockquote>
  </div>
);
