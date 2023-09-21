import { initTRPC } from "@trpc/server";
import {
  addThreadMemberProcedure,
  bulkDeleteMessagesProcedure,
  createChannelInviteProcedure,
  createMessageProcedure,
  createReactionProcedure,
  crosspostMessageProcedure,
  deleteAllReactionsProcedure,
  deleteAllReactionsForEmojiProcedure,
  deleteChannelProcedure,
  deleteChannelPermissionProcedure,
  deleteMessageProcedure,
  deleteOwnReactionProcedure,
  deleteUserReactionProcedure,
  editChannelPermissionsProcedure,
  editMessageProcedure,
  followNewsChannelProcedure,
  getChannelProcedure,
  getChannelInvitesProcedure,
  getChannelMessageProcedure,
  getChannelMessagesProcedure,
  getPinnedMessagesProcedure,
  getReactionsProcedure,
  getThreadMemberProcedure,
  groupDMAddRecipientProcedure,
  groupDMRemoveRecipientProcedure,
  joinThreadProcedure,
  leaveThreadProcedure,
  listJoinedPrivateArchivedThreadsProcedure,
  listPrivateArchivedThreadsProcedure,
  listPublicArchivedThreadsProcedure,
  listThreadMembersProcedure,
  modifyChannelProcedure,
  pinMessageProcedure,
  removeThreadMemberProcedure,
  startThreadFromMessageProcedure,
  startThreadInForumChannelProcedure,
  startThreadWithoutMessageProcedure,
  triggerTypingIndicatorProcedure,
  unpinMessageProcedure
} from "..";

const tRPC = initTRPC.create();
const appRouter = tRPC.router({
  addThreadMember: addThreadMemberProcedure(tRPC.procedure),
  bulkDeleteMessages: bulkDeleteMessagesProcedure(tRPC.procedure),
  createChannelInvite: createChannelInviteProcedure(tRPC.procedure),
  createMessage: createMessageProcedure(tRPC.procedure),
  createReaction: createReactionProcedure(tRPC.procedure),
  crosspostMessage: crosspostMessageProcedure(tRPC.procedure),
  deleteAllReactions: deleteAllReactionsProcedure(tRPC.procedure),
  deleteAllReactionsForEmoji: deleteAllReactionsForEmojiProcedure(
    tRPC.procedure
  ),
  deleteChannel: deleteChannelProcedure(tRPC.procedure),
  deleteChannelPermission: deleteChannelPermissionProcedure(tRPC.procedure),
  deleteMessage: deleteMessageProcedure(tRPC.procedure),
  deleteOwnReaction: deleteOwnReactionProcedure(tRPC.procedure),
  deleteUserReaction: deleteUserReactionProcedure(tRPC.procedure),
  editChannelPermissions: editChannelPermissionsProcedure(tRPC.procedure),
  editMessage: editMessageProcedure(tRPC.procedure),
  followNewsChannel: followNewsChannelProcedure(tRPC.procedure),
  getChannel: getChannelProcedure(tRPC.procedure),
  getChannelInvites: getChannelInvitesProcedure(tRPC.procedure),
  getChannelMessage: getChannelMessageProcedure(tRPC.procedure),
  getChannelMessages: getChannelMessagesProcedure(tRPC.procedure),
  getPinnedMessages: getPinnedMessagesProcedure(tRPC.procedure),
  getReactions: getReactionsProcedure(tRPC.procedure),
  getThreadMember: getThreadMemberProcedure(tRPC.procedure),
  groupDMAddRecipient: groupDMAddRecipientProcedure(tRPC.procedure),
  groupDMRemoveRecipient: groupDMRemoveRecipientProcedure(tRPC.procedure),
  joinThread: joinThreadProcedure(tRPC.procedure),
  leaveThread: leaveThreadProcedure(tRPC.procedure),
  listJoinedPrivateArchivedThreads: listJoinedPrivateArchivedThreadsProcedure(
    tRPC.procedure
  ),
  listPrivateArchivedThreads: listPrivateArchivedThreadsProcedure(
    tRPC.procedure
  ),
  listPublicArchivedThreads: listPublicArchivedThreadsProcedure(tRPC.procedure),
  listThreadMembers: listThreadMembersProcedure(tRPC.procedure),
  modifyChannel: modifyChannelProcedure(tRPC.procedure),
  pinMessage: pinMessageProcedure(tRPC.procedure),
  removeThreadMember: removeThreadMemberProcedure(tRPC.procedure),
  startThreadFromMessage: startThreadFromMessageProcedure(tRPC.procedure),
  startThreadInForumChannel: startThreadInForumChannelProcedure(tRPC.procedure),
  startThreadWithoutMessage: startThreadWithoutMessageProcedure(tRPC.procedure),
  triggerTypingIndicator: triggerTypingIndicatorProcedure(tRPC.procedure),
  unpinMessage: unpinMessageProcedure(tRPC.procedure)
});

export const client = appRouter.createCaller({});
