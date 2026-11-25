import type { ReactElement } from "react";
import type { UserSelect as UserSelectComponent } from "@discordkit/client/components/types/UserSelect";
import { userName } from "../format/resolve.js";
import { useSceneSettings } from "./SceneContext.js";
import { SelectControl } from "./SelectControl.js";
import { UserValueIcon } from "./SelectValueIcon.js";
import { isMultiSelect } from "./StringSelect.js";

export interface UserSelectProps {
  select: UserSelectComponent;
}

/** A User Select, closed: its placeholder, or its default users by their display names from the scene, with their avatars, one on its own or several as pills. A user the scene does not list is `unknown-user`. */
export const UserSelect = ({ select }: UserSelectProps): ReactElement => {
  const { context } = useSceneSettings();
  const multi = isMultiSelect(select);
  const values = (select.defaultValues ?? []).map(({ id }) => ({
    label: userName(id, context),
    icon: <UserValueIcon id={id} />
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
