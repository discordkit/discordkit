import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessagePayload } from "../scene.js";
import { Container } from "./Container.js";
import { TextDisplay } from "./TextDisplay.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./Message.module.css";

export interface MessageProps {
  payload: MessagePayload;
}

/** The body of one Components V2 message: its top-level components, stacked. Author, avatar and timestamp are not drawn yet. */
export const Message = ({ payload }: MessageProps): ReactElement => (
  <div className={styles.components}>
    {payload.components.map((component, index) => {
      if (component.type === ComponentType.Container) {
        // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; components have no stable key of their own.
        return <Container key={index} component={component} />;
      }
      if (component.type === ComponentType.TextDisplay) {
        // oxlint-disable-next-line react/no-array-index-key -- as above.
        return <TextDisplay key={index} component={component} />;
      }
      throw unsupportedComponent(component.type, `a message`);
    })}
  </div>
);
