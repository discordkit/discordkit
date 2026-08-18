import type { User } from "@discordkit/client/user/types/User";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [User Update](https://discord.com/developers/docs/events/gateway-events#user-update)
 *
 * Sent when properties about the current bot's user change. Inner payload is
 * a user object.
 *
 * Never gated by an intent — Discord always sends it.
 */
export const onUserUpdate = dispatchEvent<User, `USER_UPDATE`>(`USER_UPDATE`);
