import { useMemo, type ReactElement } from "react";
import type { DefaultAvatar as DefaultAvatarData } from "../format/resolve.js";
import styles from "./DefaultAvatar.module.css";

export interface DefaultAvatarProps {
  avatar: DefaultAvatarData;
  /** The avatar box: its size, shape and place. */
  className: string;
}

/** The avatar drawn for a user who has none: their initial on a coloured circle, drawn in the page's own font so it needs no image and no network. */
export const DefaultAvatar = ({
  avatar,
  className
}: DefaultAvatarProps): ReactElement => {
  const style = useMemo(
    () => ({ backgroundColor: avatar.color }),
    [avatar.color]
  );
  return (
    <div
      className={`${className} ${styles.avatar}`}
      style={style}
      aria-hidden="true"
    >
      {avatar.initial}
    </div>
  );
};
