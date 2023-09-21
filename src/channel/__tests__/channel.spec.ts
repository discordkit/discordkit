import { mockRequest } from "../../../jest.setup";
import { inviteSchema } from "../../invite";
import { userSchema } from "../../user";
import { client } from "../__fixtures__/router";
import {
  archivedThreadsSchema,
  channelSchema,
  followedChannelSchema,
  messageSchema,
  threadMemberSchema
} from "../types";

describe(`channels`, () => {
  it(`addThreadMember`, () => {
    mockRequest.put(`/channels/:channel/thread-members/:user`);
    expect(async () =>
      client.addThreadMember({
        channel: `channelID`,
        user: `userID`
      })
    ).not.toThrow();
  });

  it(`bulkDeleteMessages`, () => {
    mockRequest.post(`/channels/:channel/messages/bulk-delete`);
    expect(async () =>
      client.bulkDeleteMessages({
        channel: `channelID`,
        body: {
          messages: [`messageID1`, `messageID2`]
        }
      })
    ).not.toThrow();
  });

  it(`createChannelInvite`, async () => {
    const result = mockRequest.post(`/channels/:channel/invites`, inviteSchema);
    const actual = await client.createChannelInvite({
      channel: `channelID`,
      body: {
        maxAge: 0,
        maxUses: 0,
        temporary: false,
        unique: false,
        targetType: 1,
        targetUserId: `userID`,
        targetApplicationId: `applicationID`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createMessage`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/messages`,
      messageSchema
    );
    const actual = await client.createMessage({
      channel: `channelID`,
      body: {
        content: `message content`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`createReaction`, () => {
    mockRequest.put(
      `/channels/:channel/messages/:message/reactions/:emoji/@me`
    );
    expect(async () =>
      client.createReaction({
        channel: `channelID`,
        message: `messageID`,
        emoji: `emojiID`
      })
    ).not.toThrow();
  });

  it(`crosspostMessage`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/messages/:message/crosspost`,
      messageSchema
    );
    const actual = await client.crosspostMessage({
      channel: `channelID`,
      message: `messageID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`deleteAllReactions`, () => {
    mockRequest.delete(`/channels/:channel/messages/:message/reactions`);
    expect(async () =>
      client.deleteAllReactions({
        channel: `channelID`,
        message: `messageID`
      })
    ).not.toThrow();
  });

  it(`deleteAllReactionsForEmoji`, () => {
    mockRequest.delete(`/channels/:channel/messages/:message/reactions/:emoji`);
    expect(async () =>
      client.deleteAllReactionsForEmoji({
        channel: `channelID`,
        message: `messageID`,
        emoji: `emojiID`
      })
    ).not.toThrow();
  });

  it(`deleteChannel`, () => {
    mockRequest.delete(`/channels/:channel`);
    expect(async () =>
      client.deleteChannel({
        channel: `channelID`
      })
    ).not.toThrow();
  });

  it(`deleteChannelPermission`, () => {
    mockRequest.delete(`/channels/:channel/permissions/:overwrite`);
    expect(async () =>
      client.deleteChannelPermission({
        channel: `channelID`,
        overwrite: `overwriteID`
      })
    ).not.toThrow();
  });

  it(`deleteMessage`, () => {
    mockRequest.delete(`/channels/:channel/messages/:message`);
    expect(async () =>
      client.deleteMessage({
        channel: `channelID`,
        message: `messageID`
      })
    ).not.toThrow();
  });

  it(`deleteOwnReaction`, () => {
    mockRequest.delete(
      `/channels/:channel/messages/:message/reactions/:emoji/@me`
    );
    expect(async () =>
      client.deleteOwnReaction({
        channel: `channelID`,
        message: `messageID`,
        emoji: `emojiID`
      })
    ).not.toThrow();
  });

  it(`deleteUserReaction`, () => {
    mockRequest.delete(
      `/channels/:channel/messages/:message/reactions/:emoji/:user`
    );
    expect(async () =>
      client.deleteUserReaction({
        channel: `channelID`,
        message: `messageID`,
        emoji: `emojiID`,
        user: `userID`
      })
    ).not.toThrow();
  });

  it(`editChannelPermissions`, () => {
    mockRequest.put(`/channels/:channel/permissions/:overwrite`);
    expect(async () =>
      client.editChannelPermissions({
        channel: `channelID`,
        overwrite: `overwriteID`,
        body: {
          type: 1
        }
      })
    ).not.toThrow();
  });

  it(`editMessage`, async () => {
    const result = mockRequest.patch(
      `/channels/:channel/messages/:message`,
      messageSchema
    );
    const actual = await client.editMessage({
      channel: `channelID`,
      message: `messageID`,
      body: {
        content: `edited message content`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`followNewsChannel`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/followers`,
      followedChannelSchema
    );
    const actual = await client.followNewsChannel({
      channel: `channelID`,
      body: {
        webhookChannelId: `targetChannelID`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getChannel`, async () => {
    const result = mockRequest.get(`/channels/:channel`, channelSchema);
    const actual = await client.getChannel({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getChannelInvites`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/invites`,
      inviteSchema.array()
    );
    const actual = await client.getChannelInvites({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getChannelMessage`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/messages/:message`,
      messageSchema
    );
    const actual = await client.getChannelMessage({
      channel: `channelID`,
      message: `messageID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getChannelMessages`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/messages`,
      messageSchema.array()
    );
    const actual = await client.getChannelMessages({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getPinnedMessages`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/pins`,
      messageSchema.array()
    );
    const actual = await client.getPinnedMessages({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getReactions`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/messages/:message/reactions/:emoji`,
      userSchema.partial().array()
    );
    const actual = await client.getReactions({
      channel: `channelID`,
      message: `messageID`,
      emoji: `emojiID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`getThreadMember`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/thread-members/:user`,
      threadMemberSchema
    );
    const actual = await client.getThreadMember({
      channel: `channelID`,
      user: `userID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`groupDMAddRecipient`, () => {
    mockRequest.put(`/channels/:channel/recipients/:user`);
    expect(async () =>
      client.groupDMAddRecipient({
        channel: `channelID`,
        user: `userID`,
        body: {
          nick: `foo`,
          accessToken: `token`
        }
      })
    ).not.toThrow();
  });

  it(`groupDMRemoveRecipient`, () => {
    mockRequest.post(`/channels/:channel/recipients/:user`);
    expect(async () =>
      client.groupDMRemoveRecipient({
        channel: `channelID`,
        user: `userID`
      })
    ).not.toThrow();
  });

  it(`joinThread`, () => {
    mockRequest.put(`/channels/:channel/thread-members/@me`);
    expect(async () =>
      client.joinThread({
        channel: `channelID`
      })
    ).not.toThrow();
  });

  it(`leaveThread`, () => {
    mockRequest.delete(`/channels/:channel/thread-members/@me`);
    expect(async () =>
      client.leaveThread({
        channel: `channelID`
      })
    ).not.toThrow();
  });

  it(`listJoinedPrivateArchivedThreads`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/users/@me/threads/archived/private`,
      archivedThreadsSchema
    );
    const actual = await client.listJoinedPrivateArchivedThreads({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listPrivateArchivedThreads`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/threads/archived/private`,
      archivedThreadsSchema
    );
    const actual = await client.listPrivateArchivedThreads({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listPublicArchivedThreads`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/threads/archived/public`,
      archivedThreadsSchema
    );
    const actual = await client.listPublicArchivedThreads({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`listThreadMembers`, async () => {
    const result = mockRequest.get(
      `/channels/:channel/thread-members`,
      threadMemberSchema.array()
    );
    const actual = await client.listThreadMembers({
      channel: `channelID`
    });
    expect(actual).toStrictEqual(result);
  });

  it(`modifyChannel`, async () => {
    const result = mockRequest.patch(`/channels/:channel`, channelSchema);
    const actual = await client.modifyChannel({
      channel: `channelID`,
      body: {
        name: `new channel name`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`pinMessage`, () => {
    mockRequest.put(`/channels/:channel/pins/:message`);
    expect(async () =>
      client.pinMessage({
        channel: `channelID`,
        message: `messageID`
      })
    ).not.toThrow();
  });

  it(`removeThreadMember`, () => {
    mockRequest.delete(`/channels/:channel/thread-members/:user`);
    expect(async () =>
      client.removeThreadMember({
        channel: `channelID`,
        user: `userID`
      })
    ).not.toThrow();
  });

  it(`startThreadFromMessage`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/messages/:message/threads`,
      channelSchema
    );
    const actual = await client.startThreadFromMessage({
      channel: `channelID`,
      message: `messageID`,
      body: {
        name: `thread name`,
        rateLimitPerUser: 0
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`startThreadInForumChannel`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/threads`,
      channelSchema
    );
    const actual = await client.startThreadInForumChannel({
      channel: `channelID`,
      body: {
        name: `thread name`,
        rateLimitPerUser: 0,
        message: {
          content: `message`
        }
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`startThreadWithoutMessage`, async () => {
    const result = mockRequest.post(
      `/channels/:channel/threads`,
      channelSchema
    );
    const actual = await client.startThreadWithoutMessage({
      channel: `channelID`,
      body: {
        name: `thread name`
      }
    });
    expect(actual).toStrictEqual(result);
  });

  it(`triggerTypingIndicator`, () => {
    mockRequest.post(`/channels/:channel/typing`);
    expect(async () =>
      client.triggerTypingIndicator({
        channel: `foo`
      })
    ).not.toThrow();
  });

  it(`unpinMessage`, () => {
    mockRequest.delete(`/channels/:channel/pins/:message`);
    expect(async () =>
      client.unpinMessage({
        channel: `channelID`,
        message: `messageID`
      })
    ).not.toThrow();
  });
});
