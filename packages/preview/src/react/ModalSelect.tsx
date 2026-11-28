import { useMemo, type ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Select } from "@discordkit/client/components/types/Select";
import { useInspect } from "./Inspect.js";
import { MessageSelect } from "./MessageSelect.js";
import { useSceneSettings } from "./SceneContext.js";

export interface ModalSelectProps {
  select: Select;
  /** What has been chosen, from the scene's `values`: option values for a string select, ids for the others. Without it, the select's own defaults. */
  chosen: readonly string[] | undefined;
}

/**
 * A select menu in a modal's Label: the same closed control a message draws (so the five types read their chosen values the same way), filling the field's width at the field's height, which `FieldFrame` sets. What the scene says has been chosen is drawn as the select's defaults would be: a string select's options marked `default`, or the others' `defaultValues`, a mentionable's ids taken as roles when `context.roles` has them and as users otherwise.
 */
export const ModalSelect = ({
  select,
  chosen
}: ModalSelectProps): ReactElement => {
  const { context } = useSceneSettings();
  const drawn = useMemo((): Select => {
    if (chosen === undefined) return { ...select };
    switch (select.type) {
      case ComponentType.StringSelect:
        return {
          ...select,
          options: select.options.map((option) => ({
            ...option,
            default: chosen.includes(option.value)
          }))
        };
      case ComponentType.UserSelect:
        return {
          ...select,
          defaultValues: chosen.map((id) => ({ id, type: `user` as const }))
        };
      case ComponentType.RoleSelect:
        return {
          ...select,
          defaultValues: chosen.map((id) => ({ id, type: `role` as const }))
        };
      case ComponentType.MentionableSelect:
        return {
          ...select,
          defaultValues: chosen.map((id) => ({
            id,
            type:
              context?.roles?.[id] === undefined
                ? (`user` as const)
                : (`role` as const)
          }))
        };
      case ComponentType.ChannelSelect:
        return {
          ...select,
          defaultValues: chosen.map((id) => ({ id, type: `channel` as const }))
        };
    }
  }, [select, chosen, context]);
  return (
    <div {...useInspect(select)}>
      <MessageSelect select={drawn} />
    </div>
  );
};
