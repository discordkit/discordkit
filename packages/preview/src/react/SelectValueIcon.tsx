import { useMemo, type ReactElement } from "react";
import { defaultAvatar, resolveRole, userName } from "../format/resolve.js";
import { DefaultAvatar } from "./DefaultAvatar.js";
import { HashIcon } from "./icons.js";
import { Image } from "./Image.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./SelectValueIcon.module.css";

/** A chosen member's avatar: their picture, or the drawn initial a message header would use for them. */
export const UserValueIcon = ({ id }: { id: string }): ReactElement => {
  const { context } = useSceneSettings();
  const avatar = context?.users?.[id]?.avatar;
  return avatar === undefined ? (
    <DefaultAvatar
      avatar={defaultAvatar(id, userName(id, context))}
      className={styles.avatar}
    />
  ) : (
    <Image reference={avatar} alt="" className={styles.avatar} />
  );
};

/** A chosen role's dot, in the role's colour or, for a role without one, the muted text colour. */
export const RoleValueIcon = ({ id }: { id: string }): ReactElement => {
  const { context } = useSceneSettings();
  const { color } = resolveRole(id, context);
  const style = useMemo(
    () => (color === undefined ? undefined : { backgroundColor: color }),
    [color]
  );
  return <span className={styles.roleDot} style={style} />;
};

/** A chosen channel's hash. */
export const ChannelValueIcon = (): ReactElement => (
  <HashIcon className={styles.channel} />
);
