import { useMemo, type ReactElement, type ReactNode } from "react";
import { ChevronDownIcon, CloseIcon } from "./icons.js";
import { useInspect } from "./Inspect.js";
import styles from "./SelectControl.module.css";

/** What a select menu shows when nothing is chosen and the payload sets no `placeholder`. The client supplies this text; unverified. */
export const defaultPlaceholder = `Make a selection`;

/** One chosen value as a closed select shows it: an optional icon (an emoji, an avatar, a role's dot, a channel's hash) and its text. */
export interface SelectValue {
  label: string;
  icon?: ReactNode;
}

/** How the chosen values are drawn: one value on its own, a string select's tags, or a member, role or channel select's pills. */
export type SelectValueStyle = `single` | `tags` | `pills`;

export interface SelectControlProps {
  /** The select component this draws, for an inspecting tool (see `Inspect.ts`). */
  select: object;
  values: readonly SelectValue[];
  valueStyle: SelectValueStyle;
  placeholder: string | undefined;
  disabled: boolean;
  /** The CSS anchor name the open list is positioned against, when this is the select the scene draws open. */
  anchorName?: string;
}

const Values = ({
  values,
  valueStyle
}: {
  values: readonly SelectValue[];
  valueStyle: SelectValueStyle;
}): ReactElement => {
  // Values have no id of their own; their order in the payload is their identity.
  /* oxlint-disable react/no-array-index-key */
  switch (valueStyle) {
    case `single`: {
      const [{ label, icon }] = values;
      return (
        <div className={styles.singleValue}>
          {icon === undefined ? null : (
            <span className={styles.smallEmoji}>{icon}</span>
          )}
          <span className={styles.singleValueLabel}>{label}</span>
        </div>
      );
    }
    case `tags`:
      return (
        <div className={styles.value}>
          {values.map(({ label, icon }, index) => (
            <span key={index} className={styles.optionTag}>
              <span className={styles.tag}>
                {icon === undefined ? null : (
                  <span className={styles.smallEmoji}>{icon}</span>
                )}
                <span className={styles.tagLabel}>{label}</span>
              </span>
            </span>
          ))}
        </div>
      );
    case `pills`:
      return (
        <div className={styles.pills}>
          {values.map(({ label, icon }, index) => (
            <span key={index} className={styles.pill}>
              {icon === undefined ? null : (
                <span className={styles.pillPrefix}>{icon}</span>
              )}
              <span className={styles.pillLabel}>{label}</span>
              <CloseIcon className={styles.deleteOptionIcon} />
            </span>
          ))}
        </div>
      );
  }
  /* oxlint-enable react/no-array-index-key */
};

/**
 * What every select menu in a message shares when closed: the 40px box up to 400px wide, the placeholder or the chosen values, the chevron, and the disabled state. Each select type is its own component around this, deciding what its chosen values are.
 */
export const SelectControl = ({
  select,
  values,
  valueStyle,
  placeholder,
  disabled,
  anchorName
}: SelectControlProps): ReactElement => {
  const inspect = useInspect(select);
  // React's style type has no entry for `anchor-name` yet.
  const style = useMemo(
    (): Record<string, string> | undefined =>
      anchorName === undefined ? undefined : { anchorName },
    [anchorName]
  );
  const classes = [
    styles.select,
    disabled ? styles.disabled : ``,
    anchorName === undefined ? `` : styles.open,
    valueStyle === `pills` && values.length > 0 ? styles.withPills : ``
  ]
    .filter(Boolean)
    .join(` `);
  return (
    <div className={styles.container} {...inspect}>
      <div className={classes} style={style}>
        {values.length === 0 ? (
          <span className={styles.placeholder}>
            {placeholder ?? defaultPlaceholder}
          </span>
        ) : (
          <Values values={values} valueStyle={valueStyle} />
        )}
        <div className={styles.icons}>
          <ChevronDownIcon className={styles.dropdownIcon} />
        </div>
      </div>
    </div>
  );
};
