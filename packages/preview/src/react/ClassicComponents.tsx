import type { ReactElement } from "react";
import type { ActionRow as ActionRowComponent } from "@discordkit/client/components/types/ActionRow";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import { ActionRow } from "./ActionRow.js";
import styles from "./ClassicComponents.module.css";

export interface ClassicComponentsProps {
  /** A classic message's components, which are all action rows: anything else makes the message Components V2. */
  components: MessageComponent;
}

const isActionRow = (
  component: MessageComponent[number]
): component is ActionRowComponent =>
  component.type === ComponentType.ActionRow;

/** The rows of buttons under a classic message's content and embeds. */
export const ClassicComponents = ({
  components
}: ClassicComponentsProps): ReactElement => {
  const list: ReadonlyArray<MessageComponent[number]> = components;
  return (
    <div className={styles.components}>
      {list.filter(isActionRow).map((row, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; rows have no stable key of their own.
        <ActionRow key={index} component={row} />
      ))}
    </div>
  );
};
