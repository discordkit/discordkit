import { dispatchEvent } from "../dispatch.js";
import type { InviteDelete } from "./types/InviteEvents.js";

/**
 * ### [Invite Delete](https://discord.com/developers/docs/events/gateway-events#invite-delete)
 *
 * Sent when an invite is deleted.
 *
 * Gated by `GUILD_INVITES`.
 */
export const onInviteDelete = dispatchEvent<InviteDelete, `INVITE_DELETE`>(
  `INVITE_DELETE`,
  [`GUILD_INVITES`]
);
