import type { ReactElement } from "react";
import type { TimestampNode } from "../markdown/ast.js";
import { formatTimestamp } from "../format/timestamp.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Timestamp.module.css";

/** `<t:seconds:style>`, written for the scene's viewer and measured from the scene's clock. A time no date can hold stays as the text that was written. */
export const Timestamp = ({ node }: { node: TimestampNode }): ReactElement => {
  const { clock } = useSceneSettings();
  const text = formatTimestamp(node.timestamp, node.style, clock);
  return (
    <span className={styles.timestamp}>
      {text ?? `<t:${String(node.timestamp)}:${node.style}>`}
    </span>
  );
};
