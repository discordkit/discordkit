import { INVITE_CHANNELS, type InvitesBridge } from "../channels/invites.js";
import type { BridgeIo } from "../internal.js";

/** The activity-invites client slice — adds the `invites` namespace. */
export const invitesSlice = (io: BridgeIo): { invites: InvitesBridge } => {
  const invites: InvitesBridge = {
    send: async (userId, content) =>
      io.call(INVITE_CHANNELS.send, userId, content),
    sendJoinRequest: async (userId) =>
      io.call(INVITE_CHANNELS.sendJoinRequest, userId),
    replyToJoinRequest: async (invite) =>
      io.call(INVITE_CHANNELS.replyJoinRequest, invite),
    accept: async (invite) => io.call(INVITE_CHANNELS.accept, invite),
    onCreated: (handler) => io.on(INVITE_CHANNELS.created, handler),
    onUpdated: (handler) => io.on(INVITE_CHANNELS.updated, handler)
  };
  return { invites };
};
