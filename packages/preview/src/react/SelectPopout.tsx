import { useMemo, type ReactElement } from "react";
import type { SelectOption } from "@discordkit/client/components/types/SelectOption";
import type { StringSelect } from "@discordkit/client/components/types/StringSelect";
import { CheckIcon, SelectedIcon } from "./icons.js";
import { PartialEmoji } from "./PartialEmoji.js";
import { isMultiSelect } from "./StringSelect.js";
import styles from "./SelectPopout.module.css";

/** Marks the list of an open select, which hangs below its message, so the Node renderer can make room for it in the image. */
export const overlayAttribute = `data-discordkit-preview-overlay`;

const overlay = { [overlayAttribute]: `` };

export interface SelectPopoutProps {
  select: StringSelect;
  /** The anchor name its closed control carries. */
  anchorName: string;
}

/** An option's emoji and label, and its description under the label, lined up with the label's text when there is an emoji before it. */
const OptionContent = ({ option }: { option: SelectOption }): ReactElement => {
  const emoji = option.emoji ? (
    <span className={styles.emoji}>
      <PartialEmoji emoji={option.emoji} />
    </span>
  ) : null;
  if (option.description === undefined || option.description === ``) {
    return (
      <div className={styles.content}>
        {emoji}
        <span className={styles.plainLabel}>{option.label}</span>
      </div>
    );
  }
  return (
    <div className={styles.content}>
      <div className={styles.labelContainer}>
        <div className={styles.label}>
          {emoji}
          {option.label}
        </div>
        <div
          className={
            option.emoji
              ? `${styles.description} ${styles.offset}`
              : styles.description
          }
        >
          {option.description}
        </div>
      </div>
    </div>
  );
};

/**
 * A String Select's list, as the client shows it once the select is clicked: every option with its emoji, label and description, the ones marked `default` selected (a filled check for a single choice, a ticked box for several), in a panel 8px below the control and as wide as it.
 *
 * It is positioned with CSS anchor positioning against the closed control, from outside the card the control sits in, so the card's clipping does not cut it off: it overlays whatever is below, as the client's does.
 */
export const SelectPopout = ({
  select,
  anchorName
}: SelectPopoutProps): ReactElement => {
  const multi = isMultiSelect(select);
  // React's style type has no entry for `position-anchor` yet.
  const style = useMemo(
    (): Record<string, string> => ({ positionAnchor: anchorName }),
    [anchorName]
  );
  return (
    <div className={styles.popout} style={style} {...overlay}>
      {select.options.map((option, index) => {
        const selected = option.default === true;
        const classes = [
          styles.option,
          selected ? styles.selected : ``,
          selected && !multi ? styles.selectedSingle : ``
        ]
          .filter(Boolean)
          .join(` `);
        return (
          <div
            // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; option values are not guaranteed unique.
            key={index}
            className={classes}
          >
            <OptionContent option={option} />
            {multi ? (
              <span
                className={
                  selected
                    ? `${styles.checkbox} ${styles.checked}`
                    : `${styles.checkbox} ${styles.unchecked}`
                }
              >
                {selected ? <CheckIcon className={styles.check} /> : null}
              </span>
            ) : selected ? (
              <SelectedIcon className={styles.selectedIcon} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
