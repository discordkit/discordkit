import type { ReactElement } from "react";
import { ErrorIcon, OkIcon, WarningIcon } from "../controls/icons.js";
import styles from "./LintState.module.css";

/** The scene's state at a glance, worst first: it cannot be drawn, it has errors (Discord would refuse it), it has warnings, or it is valid. */
export type OverallState =
  | { state: `undrawable` }
  | { state: `errors`; errors: number; warnings: number }
  | { state: `warnings`; warnings: number }
  | { state: `valid` };

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? `` : `s`}`;

const ValidBadge = (): ReactElement => (
  <span className={styles.valid}>
    <OkIcon className={styles.icon} />
    Valid
  </span>
);

const WarningsBadge = ({ warnings }: { warnings: number }): ReactElement => (
  <span className={styles.warnings}>
    <WarningIcon className={styles.icon} />
    {plural(warnings, `warning`)}
  </span>
);

const ErrorsBadge = ({
  errors,
  warnings
}: {
  errors: number;
  warnings: number;
}): ReactElement => (
  <span className={styles.errors}>
    <ErrorIcon className={styles.icon} />
    {plural(errors, `error`)}
    {warnings === 0 ? null : `, ${plural(warnings, `warning`)}`}
  </span>
);

const UndrawableBadge = (): ReactElement => (
  <span className={styles.undrawable}>
    <ErrorIcon className={styles.icon} />
    Cannot be drawn
  </span>
);

export const LintState = ({
  overall
}: {
  overall: OverallState;
}): ReactElement => {
  switch (overall.state) {
    case `valid`:
      return <ValidBadge />;
    case `warnings`:
      return <WarningsBadge warnings={overall.warnings} />;
    case `errors`:
      return (
        <ErrorsBadge errors={overall.errors} warnings={overall.warnings} />
      );
    case `undrawable`:
      return <UndrawableBadge />;
  }
};
