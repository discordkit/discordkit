import type { ReactElement } from "react";
import type { RadioGroup as RadioGroupComponent } from "@discordkit/client/components/types/RadioGroup";
import { useInspect } from "./Inspect.js";
import styles from "./RadioGroup.module.css";

export interface RadioGroupProps {
  group: RadioGroupComponent;
  /** The chosen option's value, from the scene's `values`; without it, the first option marked `default`. */
  chosen: string | undefined;
}

/** A Radio Group: one row per option, its ring (filled, with a dot, when chosen), its label and its description under the label. */
export const RadioGroup = ({
  group,
  chosen
}: RadioGroupProps): ReactElement => {
  const selected =
    chosen ?? group.options.find((option) => option.default === true)?.value;
  return (
    <div className={styles.group} {...useInspect(group)}>
      {group.options.map((option) => {
        const on = option.value === selected;
        return (
          <div key={option.value} className={styles.option}>
            <span
              className={`${styles.ring} ${on ? styles.chosen : ``}`}
              aria-hidden="true"
            >
              {on ? <span className={styles.dot} /> : null}
            </span>
            <div className={styles.text}>
              <div className={styles.label}>{option.label}</div>
              {option.description === undefined ? null : (
                <div className={styles.description}>{option.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
