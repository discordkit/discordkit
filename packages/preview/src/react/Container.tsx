import type { ReactElement } from "react";
import type { Container as ContainerComponent } from "@discordkit/client/components/types/Container";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { TextDisplay } from "./TextDisplay.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./Container.module.css";

export interface ContainerProps {
  component: ContainerComponent;
}

const toHex = (color: number): string =>
  `#${color.toString(16).padStart(6, `0`)}`;

/** A Container: a bordered card whose children stack with an 8px gap, with an optional accent bar on its leading edge. */
export const Container = ({ component }: ContainerProps): ReactElement => {
  // `0x000000` is a valid accent, so test for absence rather than truthiness.
  const accent = component.accentColor ?? undefined;
  // React's style type has no entries for custom properties; this is the one the accent rule reads.
  const style: Record<string, string> | undefined =
    accent === undefined ? undefined : { "--__accent-color": toHex(accent) };
  return (
    <div
      className={
        accent === undefined
          ? styles.container
          : `${styles.container} ${styles.withAccentColor}`
      }
      style={style}
    >
      {component.components.map((child, index) => {
        if (child.type === ComponentType.TextDisplay) {
          // oxlint-disable-next-line react/no-array-index-key -- payload order is the identity; children have no stable key of their own.
          return <TextDisplay key={index} component={child} />;
        }
        throw unsupportedComponent(child.type, `a Container`);
      })}
    </div>
  );
};
