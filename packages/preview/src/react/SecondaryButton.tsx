import type { ReactElement, ReactNode } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonBase } from "./ButtonBase.js";
import styles from "./SecondaryButton.module.css";

export interface SecondaryButtonProps {
  button: Button;
  trailing?: ReactNode;
}

/** `ButtonStyle.Secondary`: the grey button, for every other choice. Both bots' answer buttons are this style. */
export const SecondaryButton = ({
  button,
  trailing
}: SecondaryButtonProps): ReactElement => (
  <ButtonBase
    button={button}
    colorClassName={styles.secondary}
    trailing={trailing}
  />
);
