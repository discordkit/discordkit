import type { ReactElement } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonBase } from "./ButtonBase.js";
import styles from "./SuccessButton.module.css";

export interface SuccessButtonProps {
  button: Button;
}

/** `ButtonStyle.Success`: the green button, for confirming. */
export const SuccessButton = ({ button }: SuccessButtonProps): ReactElement => (
  <ButtonBase button={button} colorClassName={styles.success} />
);
