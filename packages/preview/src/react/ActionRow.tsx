import type { ReactElement } from "react";
import type { ActionRow as ActionRowComponent } from "@discordkit/client/components/types/ActionRow";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { MessageButton } from "./MessageButton.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./ActionRow.module.css";

const buttonType: number = ComponentType.Button;

export interface ActionRowProps {
  component: ActionRowComponent;
}

/** An Action Row of buttons. A select menu in a row is not drawn yet, and is refused rather than left out. */
export const ActionRow = ({ component }: ActionRowProps): ReactElement => {
  const children = component.components;
  if (!Array.isArray(children)) {
    throw unsupportedComponent(children.type, `an Action Row`);
  }
  return (
    <div className={styles.actionRow}>
      <div className={styles.children}>
        {children.map((child, index) => {
          // The schema admits only buttons in an array, but a payload built without it can hold anything.
          const { type }: { type: number } = child;
          if (type !== buttonType) {
            throw unsupportedComponent(type, `an Action Row`);
          }
          // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; buttons have no stable key of their own.
          return <MessageButton key={index} button={child} />;
        })}
      </div>
    </div>
  );
};
