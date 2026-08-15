import { dispatchEvent } from "../dispatch.js";
import type { InviteCreate } from "./types/InviteEvents.js";

/**
 * ### [Invite Create](https://discord.com/developers/docs/events/gateway-events#invite-create)
 *
 * Sent when an invite is created. `uses` is always 0 — nobody has used it yet.
 *
 * Gated by `GUILD_INVITES`.
 */
export const onInviteCreate = dispatchEvent<InviteCreate, `INVITE_CREATE`>(
  `INVITE_CREATE`,
  [`GUILD_INVITES`]
);
