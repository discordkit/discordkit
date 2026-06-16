import type { UserId } from "@discordkit/native";
import { getCurrentUser, getUser } from "@discordkit/native/users";
import { USER_CHANNELS } from "../channels/users.js";
import type { RegisterContext } from "../internal.js";

/**
 * Wire the users domain's RPC handlers into the sidecar. Pass to
 * `createSidecar([registerUsers])`. Imports ONLY `@discordkit/native/users`, so a
 * sidecar that doesn't compose this bundles none of the users native code — the
 * tree-shaking boundary on the sidecar binary.
 *
 * ```ts
 * import { createSidecar } from "@discordkit/tauri/sidecar";
 * import { registerUsers } from "@discordkit/tauri/sidecar/users";
 * createSidecar([registerUsers]);
 * ```
 */
export const registerUsers = ({ handle }: RegisterContext): void => {
  handle(USER_CHANNELS.getCurrent, () => getCurrentUser());
  handle(USER_CHANNELS.get, (userId: UserId) => getUser(userId));
};
