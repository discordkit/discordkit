import type { ReactElement, ReactNode } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonBase } from "./ButtonBase.js";
import styles from "./PrimaryButton.module.css";

export interface PrimaryButtonProps {
  button: Button;
  label?: string;
  leading?: ReactNode;
}

/** `ButtonStyle.Primary`: the blurple button, for the action a message most wants taken. */
export const PrimaryButton = ({
  button,
  label,
  leading
}: PrimaryButtonProps): ReactElement => (
  <ButtonBase
    button={button}
    colorClassName={styles.primary}
    label={label}
    leading={leading}
  />
);
