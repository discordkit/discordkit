import type { ReactElement } from "react";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Section as SectionComponent } from "@discordkit/client/components/types/Section";
import { useInspect } from "./Inspect.js";
import { MessageButton } from "./MessageButton.js";
import { TextDisplay } from "./TextDisplay.js";
import { Thumbnail } from "./Thumbnail.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./Section.module.css";

export interface SectionProps {
  component: SectionComponent;
}

const textDisplayType: number = ComponentType.TextDisplay;

/** The accessory beside the text: a thumbnail, or a button capped at half the section's width less the gap. */
const Accessory = ({
  accessory
}: {
  accessory: SectionComponent[`accessory`];
}): ReactElement => {
  switch (accessory.type) {
    case ComponentType.Thumbnail:
      return (
        <div className={styles.accessory}>
          <Thumbnail component={accessory} />
        </div>
      );
    case ComponentType.Button:
      return (
        <div className={`${styles.accessory} ${styles.restrictWidth}`}>
          <MessageButton button={accessory} />
        </div>
      );
    default:
      // The schema admits only a thumbnail or a button, but a payload built without it can hold anything.
      throw unsupportedComponent(
        (accessory satisfies never as { type: number }).type,
        `a Section's accessory`
      );
  }
};

/**
 * A Section: one to three text displays stacked on the left, and an accessory on the right, a thumbnail or a button, aligned to the top.
 */
export const Section = ({ component }: SectionProps): ReactElement => (
  <div className={styles.section} {...useInspect(component)}>
    <div className={styles.children}>
      <div className={styles.textChildren}>
        {component.components.map((child, index) => {
          // Discord says a section may hold more than text one day; until then, anything else is refused rather than left out.
          const { type }: { type: number } = child;
          if (type !== textDisplayType) {
            throw unsupportedComponent(type, `a Section`);
          }
          return (
            // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; text displays have no stable key of their own.
            <TextDisplay key={index} component={child} />
          );
        })}
      </div>
      <Accessory accessory={component.accessory} />
    </div>
  </div>
);
