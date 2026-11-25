import type { ReactElement } from "react";
import type { ActionRow as ActionRowComponent } from "@discordkit/client/components/types/ActionRow";
import type { Button } from "@discordkit/client/components/types/Button";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Select } from "@discordkit/client/components/types/Select";
import type { TextInput } from "@discordkit/client/components/types/TextInput";
import { MessageButton } from "./MessageButton.js";
import { MessageSelect } from "./MessageSelect.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./ActionRow.module.css";

export interface ActionRowProps {
  component: ActionRowComponent;
}

/** An Action Row: up to five buttons, or one select menu. */
export const ActionRow = ({ component }: ActionRowProps): ReactElement => {
  // Discord sends and expects an array. The client's schema has a select as a bare object (fixed in #106), so a payload typed against it may hold one; draw it the same.
  const children: ReadonlyArray<Button | Select | TextInput> = Array.isArray(
    component.components
  )
    ? component.components
    : [component.components];
  return (
    <div className={styles.actionRow}>
      <div className={styles.children}>
        {children.map((child, index) => {
          // Payload order is the identity of each child; none has a stable key of its own.
          /* oxlint-disable react/no-array-index-key */
          switch (child.type) {
            case ComponentType.Button:
              return <MessageButton key={index} button={child} />;
            case ComponentType.StringSelect:
            case ComponentType.UserSelect:
            case ComponentType.RoleSelect:
            case ComponentType.MentionableSelect:
            case ComponentType.ChannelSelect:
              return <MessageSelect key={index} select={child} />;
            // A text input belongs in a modal, though the schema admits it here; a payload built without the schema can hold anything.
            case ComponentType.TextInput:
            default:
              throw unsupportedComponent(child.type, `an Action Row`);
          }
          /* oxlint-enable react/no-array-index-key */
        })}
      </div>
    </div>
  );
};
