import type { ReactElement } from "react";
import type { Button } from "@discordkit/client/components/types/Button";
import { LaunchIcon } from "./icons.js";
import { SecondaryButton } from "./SecondaryButton.js";
import styles from "./LinkButton.module.css";

export interface LinkButtonProps {
  button: Button;
}

/** `ButtonStyle.Link`: a grey button that opens its URL, marked as leaving Discord by an arrow-out-of-a-box after its label. The grey fill is inferred: the stylesheet does not say which colour a link button takes. */
export const LinkButton = ({ button }: LinkButtonProps): ReactElement => (
  <SecondaryButton
    button={button}
    trailing={<LaunchIcon className={styles.launchIcon} />}
  />
);
