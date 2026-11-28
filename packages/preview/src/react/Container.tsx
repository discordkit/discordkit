import type { ReactElement } from "react";
import type { Container as ContainerComponent } from "@discordkit/client/components/types/Container";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { colorToHex } from "../format/color.js";
import { ActionRow } from "./ActionRow.js";
import { MediaGallery } from "./MediaGallery.js";
import { Separator } from "./Separator.js";
import { TextDisplay } from "./TextDisplay.js";
import { unsupportedComponent } from "./unsupportedComponent.js";
import styles from "./Container.module.css";

export interface ContainerProps {
  component: ContainerComponent;
}

type Child = ContainerComponent[`components`][number];

/** One child of a container, drawn by its own component. */
const renderChild = (child: Child, key: number): ReactElement => {
  switch (child.type) {
    case ComponentType.TextDisplay:
      return <TextDisplay key={key} component={child} />;
    case ComponentType.Separator:
      return <Separator key={key} component={child} />;
    case ComponentType.MediaGallery:
      return <MediaGallery key={key} component={child} />;
    case ComponentType.ActionRow:
      return <ActionRow key={key} component={child} />;
    case ComponentType.Section:
    case ComponentType.File:
      throw unsupportedComponent(child.type, `a Container`);
    default:
      throw unsupportedComponent(
        (child satisfies never as { type: number }).type,
        `a Container`
      );
  }
};

/** A Container: a bordered card whose children stack with an 8px gap, with an optional accent bar on its leading edge. */
export const Container = ({ component }: ContainerProps): ReactElement => {
  // `0x000000` is a valid accent, so test for absence rather than truthiness.
  const accent = component.accentColor ?? undefined;
  // React's style type has no entries for custom properties; this is the one the accent rule reads.
  const style: Record<string, string> | undefined =
    accent === undefined
      ? undefined
      : { "--__accent-color": colorToHex(accent) };
  return (
    <div
      className={
        accent === undefined
          ? styles.container
          : `${styles.container} ${styles.withAccentColor}`
      }
      style={style}
    >
      {component.components.map((child, index) => renderChild(child, index))}
    </div>
  );
};
