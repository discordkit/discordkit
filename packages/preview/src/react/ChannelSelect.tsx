import type { ReactElement } from "react";
import type { ChannelSelect as ChannelSelectComponent } from "@discordkit/client/components/types/ChannelSelect";
import { channelMentionLabel } from "../format/resolve.js";
import { useSceneSettings } from "./SceneContext.js";
import { SelectControl } from "./SelectControl.js";
import { ChannelValueIcon } from "./SelectValueIcon.js";
import { isMultiSelect } from "./StringSelect.js";

export interface ChannelSelectProps {
  select: ChannelSelectComponent;
}

/** A Channel Select, closed: its placeholder, or its default channels by name from the scene after a hash, one on its own or several as pills. A channel the scene does not list is `unknown`. */
export const ChannelSelect = ({ select }: ChannelSelectProps): ReactElement => {
  const { context } = useSceneSettings();
  const multi = isMultiSelect(select);
  const values = (select.defaultValues ?? []).map(({ id }) => ({
    label: channelMentionLabel(id, context),
    icon: <ChannelValueIcon />
  }));
  return (
    <SelectControl
      values={multi ? values : values.slice(0, 1)}
      valueStyle={multi ? `pills` : `single`}
      placeholder={select.placeholder}
      disabled={select.disabled ?? false}
    />
  );
};
