import type { ReactElement, ReactNode } from "react";
import type { FieldProblem } from "../modal.js";
import { useInspect } from "./Inspect.js";
import styles from "./FieldFrame.module.css";

export interface FieldFrameProps {
  /** The component the frame stands for, for an inspecting tool: a Label, or a Text Input that carries its own label in the older form. */
  component: object;
  title: string;
  description?: string;
  /** Drawn with the red asterisk after the title. */
  required: boolean;
  /** Shown under the control after Submit, in the client's error colour. */
  problem: FieldProblem | null;
  /** What the problem is about, for its wording: a text input's characters, a group's choices, an upload's files. */
  noun: `characters` | `choices` | `files`;
  children: ReactNode;
}

/** The words under a field the client refuses to submit. Discord's own wording is decided in JavaScript and was not seen in any capture or screenshot; these are ours. */
export const problemText = (
  problem: FieldProblem,
  noun: FieldFrameProps[`noun`]
): string => {
  switch (problem.kind) {
    case `required`:
      return `This field is required.`;
    case `tooShort`:
      return `Must be at least ${String(problem.min)} characters long.`;
    case `tooFew`:
      return noun === `files`
        ? `Upload at least ${String(problem.min)} ${problem.min === 1 ? `file` : `files`}.`
        : `Choose at least ${String(problem.min)}.`;
  }
};

/**
 * What every field of a modal has around its control: the title (a Label's `label`), the red asterisk when it is required, the description, and the error after Submit. The control is the frame's child.
 */
export const FieldFrame = ({
  component,
  title,
  description,
  required,
  problem,
  noun,
  children
}: FieldFrameProps): ReactElement => (
  <div className={styles.field} {...useInspect(component)}>
    <div className={styles.title}>
      {title}
      {required ? (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      ) : null}
    </div>
    {description === undefined || description === `` ? null : (
      <div className={styles.description}>{description}</div>
    )}
    <div className={styles.control} data-error={problem ? `true` : undefined}>
      {children}
    </div>
    {problem ? (
      <div className={styles.error} role="alert">
        {problemText(problem, noun)}
      </div>
    ) : null}
  </div>
);
