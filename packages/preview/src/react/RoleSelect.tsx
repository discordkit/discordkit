import type { ReactElement } from "react";
import type { RoleSelect as RoleSelectComponent } from "@discordkit/client/components/types/RoleSelect";
import { resolveRole } from "../format/resolve.js";
import { useSceneSettings } from "./SceneContext.js";
import { SelectControl } from "./SelectControl.js";
import { RoleValueIcon } from "./SelectValueIcon.js";
import { isMultiSelect } from "./StringSelect.js";

export interface RoleSelectProps {
  select: RoleSelectComponent;
}

/** A Role Select, closed: its placeholder, or its default roles by name from the scene, each with a dot in the role's colour, one on its own or several as pills. A role the scene does not list is `deleted-role`. */
export const RoleSelect = ({ select }: RoleSelectProps): ReactElement => {
  const { context } = useSceneSettings();
  const multi = isMultiSelect(select);
  const values = (select.defaultValues ?? []).map(({ id }) => ({
    label: resolveRole(id, context).label,
    icon: <RoleValueIcon id={id} />
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
