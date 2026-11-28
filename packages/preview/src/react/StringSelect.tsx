import type { ReactElement } from "react";
import type { StringSelect as StringSelectComponent } from "@discordkit/client/components/types/StringSelect";
import { useOpenSelectAnchor } from "./OpenSelect.js";
import { PartialEmoji } from "./PartialEmoji.js";
import { SelectControl, type SelectValue } from "./SelectControl.js";

export interface StringSelectProps {
  select: StringSelectComponent;
}

/** Whether a select lets more than one value be chosen, which changes how its chosen values are drawn: `maxValues` above 1. Discord's default is 1. */
export const isMultiSelect = (select: { maxValues?: number }): boolean =>
  (select.maxValues ?? 1) > 1;

/**
 * A String Select, closed: its placeholder, or the options marked `default`, one on its own or several as tags, with each option's emoji. When the scene's `openSelect` names it, it carries the anchor its list is drawn against.
 */
export const StringSelect = ({ select }: StringSelectProps): ReactElement => {
  const anchorName = useOpenSelectAnchor(select.customId);
  const values: SelectValue[] = select.options
    .filter((option) => option.default === true)
    .map((option) => ({
      label: option.label,
      ...(option.emoji ? { icon: <PartialEmoji emoji={option.emoji} /> } : {})
    }));
  const multi = isMultiSelect(select);
  return (
    <SelectControl
      values={multi ? values : values.slice(0, 1)}
      valueStyle={multi ? `tags` : `single`}
      placeholder={select.placeholder}
      disabled={select.disabled ?? false}
      anchorName={anchorName}
    />
  );
};
