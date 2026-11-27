import { useId, type ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Popover
} from "react-aria-components";
import type { HistoryStep } from "../document/documentState.js";
import { ChevronIcon, RedoIcon, UndoIcon } from "../controls/icons.js";
import styles from "./History.module.css";

export interface HistoryProps {
  done: readonly HistoryStep[];
  undone: readonly HistoryStep[];
  onUndo: () => void;
  onRedo: () => void;
  /** Why neither can be used now, when they cannot: a conflict waiting on the person's choice. */
  disabledReason: string | undefined;
}

const time = (at: number): string =>
  new Date(at).toLocaleTimeString(undefined, {
    hour: `2-digit`,
    minute: `2-digit`,
    second: `2-digit`
  });

const origins = { mine: `You`, file: `From the file` };

const StepItem = ({
  step,
  state
}: {
  step: HistoryStep;
  state: `current` | `done` | `undone`;
}): ReactElement => (
  <li
    className={state === `undone` ? styles.undone : styles.step}
    aria-current={state === `current` ? `step` : undefined}
  >
    <span className={step.origin === `file` ? styles.file : styles.mine}>
      {origins[step.origin]}
    </span>
    <span className={styles.label}>
      {step.label}
      {state === `undone` ? (
        <span className={styles.visuallyHidden}>, undone</span>
      ) : null}
    </span>
    <time className={styles.time} dateTime={new Date(step.at).toISOString()}>
      {time(step.at)}
    </time>
  </li>
);

/**
 * Undo, redo, and the history they move through: the person's own edits and the changes that arrived from the file, in the order they were shown. Each button names the step it would take back or bring again, so an undo that would take back an agent's change says so before it is pressed.
 */
export const History = ({
  done,
  undone,
  onUndo,
  onRedo,
  disabledReason
}: HistoryProps): ReactElement => {
  const last = done.at(-1);
  const next = undone.at(-1);
  const off = disabledReason !== undefined;
  const headingId = useId();
  return (
    <div className={styles.controls}>
      <Button
        className={styles.button}
        onPress={onUndo}
        isDisabled={off || last === undefined}
        aria-label={last === undefined ? `Undo` : `Undo ${last.label}`}
        aria-keyshortcuts="Control+Z Meta+Z"
      >
        <UndoIcon className={styles.icon} />
        Undo
      </Button>
      <Button
        className={styles.button}
        onPress={onRedo}
        isDisabled={off || next === undefined}
        aria-label={next === undefined ? `Redo` : `Redo ${next.label}`}
        aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
      >
        <RedoIcon className={styles.icon} />
        Redo
      </Button>
      <DialogTrigger>
        <Button className={styles.button} aria-label="Show the history">
          History
          <ChevronIcon className={styles.icon} />
        </Button>
        <Popover className={styles.popover} placement="bottom end">
          <Dialog className={styles.dialog} aria-labelledby={headingId}>
            <Heading id={headingId} slot="title" className={styles.heading}>
              History
            </Heading>
            <p className={styles.help}>
              Undo takes back the latest step, whoever made it. A change from
              the file is a step of its own: to undo an edit of yours made
              before it, undo that change first.
              {off ? ` ${disabledReason}` : ``}
            </p>
            {done.length === 0 && undone.length === 0 ? (
              <p className={styles.empty}>Nothing has changed yet.</p>
            ) : (
              <ol className={styles.list} aria-label="Steps, newest first">
                {[...undone].map((step) => (
                  <StepItem
                    key={`u${String(step.at)}${step.label}`}
                    step={step}
                    state="undone"
                  />
                ))}
                {[...done].reverse().map((step, index) => (
                  <StepItem
                    key={`d${String(step.at)}${step.label}`}
                    step={step}
                    state={index === 0 ? `current` : `done`}
                  />
                ))}
              </ol>
            )}
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
};
