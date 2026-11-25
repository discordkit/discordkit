import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import { ActionRow } from "./ActionRow.js";
import { Container } from "./Container.js";
import { FileAttachment } from "./FileAttachment.js";
import { MediaGallery } from "./MediaGallery.js";
import { Section } from "./Section.js";
import { Separator } from "./Separator.js";
import { TextDisplay } from "./TextDisplay.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./MessageComponents.module.css";

export interface MessageComponentsProps {
  components: MessageComponent;
}

/** The body of one Components V2 message: its top-level components, stacked. */
export const MessageComponents = ({
  components
}: MessageComponentsProps): ReactElement => (
  <div className={styles.components}>
    {components.map((component, index) => {
      switch (component.type) {
        // oxlint-disable react/no-array-index-key -- payload order is the identity; components have no stable key of their own.
        case ComponentType.Container:
          return <Container key={index} component={component} />;
        case ComponentType.TextDisplay:
          return <TextDisplay key={index} component={component} />;
        case ComponentType.Separator:
          return <Separator key={index} component={component} />;
        case ComponentType.MediaGallery:
          return <MediaGallery key={index} component={component} />;
        case ComponentType.ActionRow:
          return <ActionRow key={index} component={component} />;
        case ComponentType.Section:
          return <Section key={index} component={component} />;
        case ComponentType.File:
          return <FileAttachment key={index} component={component} />;
        // oxlint-enable react/no-array-index-key
        default:
          throw unsupportedComponent(
            (component satisfies never as { type: number }).type,
            `a message`
          );
      }
    })}
  </div>
);
