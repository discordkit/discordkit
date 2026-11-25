import type { ReactElement } from "react";
import type { MentionableSelect as MentionableSelectComponent } from "@discordkit/client/components/types/MentionableSelect";
import { resolveRole, userName } from "../format/resolve.js";
import { useSceneSettings } from "./SceneContext.js";
import { SelectControl } from "./SelectControl.js";
import { RoleValueIcon, UserValueIcon } from "./SelectValueIcon.js";
import { isMultiSelect } from "./StringSelect.js";

export interface MentionableSelectProps {
  select: MentionableSelectComponent;
}

/** A Mentionable Select, closed: its placeholder, or its default users and roles, each drawn as a User Select or a Role Select draws it, one on its own or several as pills. */
export const MentionableSelect = ({
  select
}: MentionableSelectProps): ReactElement => {
  const { context } = useSceneSettings();
  const multi = isMultiSelect(select);
  const values = (select.defaultValues ?? []).map(({ id, type }) =>
    type === `role`
      ? {
          label: resolveRole(id, context).label,
          icon: <RoleValueIcon id={id} />
        }
      : { label: userName(id, context), icon: <UserValueIcon id={id} /> }
  );
  return (
    <SelectControl
      values={multi ? values : values.slice(0, 1)}
      valueStyle={multi ? `pills` : `single`}
      placeholder={select.placeholder}
      disabled={select.disabled ?? false}
    />
  );
};
