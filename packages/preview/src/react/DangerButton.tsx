import type { ReactElement } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonBase } from "./ButtonBase.js";
import styles from "./DangerButton.module.css";

export interface DangerButtonProps {
  button: Button;
}

/** `ButtonStyle.Danger`: the red button, for something that cannot be undone, like Inbou's "End test". */
export const DangerButton = ({ button }: DangerButtonProps): ReactElement => (
  <ButtonBase button={button} colorClassName={styles.danger} />
);
