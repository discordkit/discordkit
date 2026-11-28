import type { ReactElement } from "react";
import type { Checkbox } from "@discordkit/client/components/types/Checkbox";
import type { Label } from "@discordkit/client/components/types/Label";
import { CheckboxMark } from "./CheckboxMark.js";
import { useInspect } from "./Inspect.js";
import styles from "./CheckboxField.module.css";

export interface CheckboxFieldProps {
  label: Label;
  checkbox: Checkbox;
  ticked: boolean;
}

/**
 * A Label wrapping a single Checkbox, drawn as Discord's screenshot of one shows it: the box with the Label's text beside it and the description under that, and no asterisk, since a checkbox cannot be required.
 */
export const CheckboxField = ({
  label,
  checkbox,
  ticked
}: CheckboxFieldProps): ReactElement => (
  <div className={styles.field} {...useInspect(label)}>
    <span {...useInspect(checkbox)}>
      <CheckboxMark ticked={ticked} />
    </span>
    <div className={styles.text}>
      <div className={styles.label}>{label.label}</div>
      {label.description === undefined || label.description === `` ? null : (
        <div className={styles.description}>{label.description}</div>
      )}
    </div>
  </div>
);
