import {
  sendActivityInvite,
  sendActivityJoinRequest,
  replyToActivityJoinRequest,
  acceptActivityInvite,
  onActivityInviteCreated,
  onActivityInviteUpdated,
  type ActivityInvite
} from "@discordkit/native/activity-invites";
import type { UserId } from "@discordkit/native";
import { INVITE_CHANNELS } from "../channels/invites.js";
import type { RegisterContext } from "../internal.js";

/**
 * Wire the activity-invites domain: its IPC handlers + the incoming-invite event
 * broadcasts. Imports ONLY `@discordkit/native/activity-invites`.
 */
export const registerInvites = ({
  handle,
  broadcast,
  track
}: RegisterContext): void => {
  handle(INVITE_CHANNELS.send, async (_e, userId: UserId, content?: string) =>
    sendActivityInvite(userId, content)
  );
  handle(INVITE_CHANNELS.sendJoinRequest, async (_e, userId: UserId) =>
    sendActivityJoinRequest(userId)
  );
  handle(INVITE_CHANNELS.replyJoinRequest, async (_e, invite: ActivityInvite) =>
    replyToActivityJoinRequest(invite)
  );
  handle(INVITE_CHANNELS.accept, async (_e, invite: ActivityInvite) =>
    acceptActivityInvite(invite)
  );

  track(
    onActivityInviteCreated((invite) =>
      broadcast(INVITE_CHANNELS.created, invite)
    )
  );
  track(
    onActivityInviteUpdated((invite) =>
      broadcast(INVITE_CHANNELS.updated, invite)
    )
  );
};
