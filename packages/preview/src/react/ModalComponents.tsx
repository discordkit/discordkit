import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Component } from "@discordkit/client/components/types/Component";
import { LegacyTextInputRow } from "./LegacyTextInputRow.js";
import { ModalLabel } from "./ModalLabel.js";
import { TextDisplay } from "./TextDisplay.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./ModalComponents.module.css";

export interface ModalComponentsProps {
  /** A modal's top-level components, as @discordkit/client types a modal's callback data. */
  components: readonly Component[];
}

/** One top-level component of a modal. Anything but a Label, a Text Display or an Action Row throws, as `supportedComponents.modal` says. */
const drawn = (component: Component, key: number): ReactElement => {
  if (component.type === ComponentType.Label) {
    return <ModalLabel key={key} component={component} />;
  }
  if (component.type === ComponentType.TextDisplay) {
    return <TextDisplay key={key} component={component} />;
  }
  if (component.type === ComponentType.ActionRow) {
    return <LegacyTextInputRow key={key} component={component} />;
  }
  throw unsupportedComponent(component.type, `a modal`);
};

/** The fields of a modal, top to bottom: Labels, Text Displays, and the older Action Rows of one Text Input. Payload order is each one's identity; none has a stable key of its own. */
export const ModalComponents = ({
  components
}: ModalComponentsProps): ReactElement => (
  <div className={styles.components}>{components.map(drawn)}</div>
);
