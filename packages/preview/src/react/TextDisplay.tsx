import type { ReactElement } from "react";
import type { TextDisplay as TextDisplayComponent } from "@discordkit/client/components/types/TextDisplay";
import { parseMarkdown } from "../markdown/parse.js";
import { Markup } from "./Markup.js";
import styles from "./TextDisplay.module.css";

export interface TextDisplayProps {
  component: TextDisplayComponent;
}

/** A Text Display: its content parsed with the rules Discord applies to text displays and drawn as Discord's markup. */
export const TextDisplay = ({ component }: TextDisplayProps): ReactElement => (
  <div className={styles.textDisplay}>
    <Markup nodes={parseMarkdown(component.content, `textDisplay`)} />
  </div>
);
