import type { ReactElement } from "react";
import type { TextDisplay as TextDisplayComponent } from "@discordkit/client/components/types/TextDisplay";
import styles from "./TextDisplay.module.css";

export interface TextDisplayProps {
  component: TextDisplayComponent;
}

/** A Text Display, drawn as plain text. Markdown is not parsed yet, so `**bold**` renders as typed. */
export const TextDisplay = ({ component }: TextDisplayProps): ReactElement => (
  <div className={styles.textDisplay}>{component.content}</div>
);
