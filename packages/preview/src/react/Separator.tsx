import type { ReactElement } from "react";
import type { Separator as SeparatorComponent } from "@discordkit/client/components/types/Separator";
import styles from "./Separator.module.css";

export interface SeparatorProps {
  component: SeparatorComponent;
}

/** A Separator: space between its neighbours, with a 1px line across it unless `divider` is `false`. Spacing `2` is the large size. */
export const Separator = ({ component }: SeparatorProps): ReactElement => {
  const className = [
    styles.separator,
    // Discord's defaults: a divider, at small spacing.
    component.divider === false ? `` : styles.divider,
    component.spacing === 2 ? styles.spacingLarge : ``
  ]
    .filter(Boolean)
    .join(` `);
  return <hr className={className} />;
};
