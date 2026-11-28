import type { ReactElement } from "react";
import type { CheckboxGroup as CheckboxGroupComponent } from "@discordkit/client/components/types/CheckboxGroup";
import { CheckboxMark } from "./CheckboxMark.js";
import { useInspect } from "./Inspect.js";
import styles from "./CheckboxGroup.module.css";

export interface CheckboxGroupProps {
  group: CheckboxGroupComponent;
  /** The ticked options' values, from the scene's `values`; without it, the options marked `default`. */
  ticked: readonly string[] | undefined;
}

/** A Checkbox Group: one row per option, its box, its label and its description under the label. */
export const CheckboxGroup = ({
  group,
  ticked
}: CheckboxGroupProps): ReactElement => (
  <div className={styles.group} {...useInspect(group)}>
    {group.options.map((option) => (
      <div key={option.value} className={styles.option}>
        <CheckboxMark
          ticked={
            ticked === undefined
              ? option.default === true
              : ticked.includes(option.value)
          }
        />
        <div className={styles.text}>
          <div className={styles.label}>{option.label}</div>
          {option.description === undefined ? null : (
            <div className={styles.description}>{option.description}</div>
          )}
        </div>
      </div>
    ))}
  </div>
);
