import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { onMessageDelete } from "../messages/onMessageDelete.js";
import { onMessageDeleteBulk } from "../messages/onMessageDeleteBulk.js";
import { onMessagePollVoteAdd } from "../poll/onMessagePollVoteAdd.js";
import { onMessageReactionAdd } from "../messages/onMessageReactionAdd.js";
import { onMessageReactionRemove } from "../messages/onMessageReactionRemove.js";
import { messageDeleteSchema } from "../messages/types/MessageDelete.js";
import { messagePollVoteSchema } from "../poll/types/MessagePollVote.js";
import {
  messageReactionAddSchema,
  messageReactionRemoveSchema
} from "../messages/types/MessageReaction.js";
import { ReactionType } from "../messages/types/ReactionType.js";

/**
 * Unlike the alias events, these payloads are hand-written from the docs' field
 * tables, so the schemas ARE the thing that can be wrong. Each spec parses a
 * payload shaped exactly as Discord documents it — camelized, since the
 * connection camelizes at the transport boundary before handlers see it.
 */

const issuesOf = (result: v.SafeParseResult<v.GenericSchema>): string[] =>
  result.success
    ? []
    : result.issues.map(
        (i) =>
          `${i.path?.map((p) => String(p.key)).join(`.`) ?? `?`}: ${i.message}`
      );

describe(`message delete schemas`, () => {
  it(`accepts a guild delete`, () => {
    expect(
      issuesOf(
        v.safeParse(messageDeleteSchema, {
          id: `1`,
          channelId: `2`,
          guildId: `3`
        })
      )
    ).toEqual([]);
  });

  it(`accepts a DM delete, which has no guildId`, () => {
    // guildId is optional precisely because DMs have no guild — requiring it
    // would reject every direct-message delete at runtime.
    expect(
      issuesOf(v.safeParse(messageDeleteSchema, { id: `1`, channelId: `2` }))
    ).toEqual([]);
  });
});

describe(`message reaction schemas`, () => {
  it(`accepts an add with a partial emoji and member`, () => {
    const payload = {
      userId: `1`,
      channelId: `2`,
      messageId: `3`,
      guildId: `4`,
      // A reaction emoji arrives with just id + name (both nullable). Note
      // this does NOT distinguish partial from full: `emojiSchema` marks
      // everything else `exactOptional`, so both accept this payload.
      emoji: { id: null, name: `👍` },
      burst: false,
      type: ReactionType.NORMAL
    };
    expect(issuesOf(v.safeParse(messageReactionAddSchema, payload))).toEqual(
      []
    );
  });

  it(`accepts a burst reaction with its colors`, () => {
    const payload = {
      userId: `1`,
      channelId: `2`,
      messageId: `3`,
      emoji: { id: null, name: `🔥` },
      burst: true,
      burstColors: [`#ff0000`],
      type: ReactionType.BURST
    };
    expect(issuesOf(v.safeParse(messageReactionAddSchema, payload))).toEqual(
      []
    );
  });

  it(`rejects a reaction missing its required type`, () => {
    // `type` distinguishes normal from super-reactions; dropping it would make
    // burst handling silently fall through.
    const result = v.safeParse(messageReactionAddSchema, {
      userId: `1`,
      channelId: `2`,
      messageId: `3`,
      emoji: { id: null, name: `👍` },
      burst: false
    });
    expect(result.success).toBe(false);
  });

  it(`accepts a remove, which carries no member`, () => {
    expect(
      issuesOf(
        v.safeParse(messageReactionRemoveSchema, {
          userId: `1`,
          channelId: `2`,
          messageId: `3`,
          emoji: { id: null, name: `👍` },
          burst: false,
          type: ReactionType.NORMAL
        })
      )
    ).toEqual([]);
  });
});

describe(`message poll vote schema`, () => {
  it(`accepts a vote`, () => {
    expect(
      issuesOf(
        v.safeParse(messagePollVoteSchema, {
          userId: `1`,
          channelId: `2`,
          messageId: `3`,
          guildId: `4`,
          answerId: 1
        })
      )
    ).toEqual([]);
  });
});

describe(`message event wiring`, () => {
  it(`subscribes to the documented wire names`, () => {
    expect(onMessageDelete.event).toBe(`MESSAGE_DELETE`);
    expect(onMessageDeleteBulk.event).toBe(`MESSAGE_DELETE_BULK`);
    expect(onMessageReactionAdd.event).toBe(`MESSAGE_REACTION_ADD`);
    expect(onMessageReactionRemove.event).toBe(`MESSAGE_REACTION_REMOVE`);
    expect(onMessagePollVoteAdd.event).toBe(`MESSAGE_POLL_VOTE_ADD`);
  });

  it(`reports the intents that gate each event`, () => {
    expect(onMessageReactionAdd.intents).toEqual([
      `GUILD_MESSAGE_REACTIONS`,
      `DIRECT_MESSAGE_REACTIONS`
    ]);
    expect(onMessagePollVoteAdd.intents).toEqual([
      `GUILD_MESSAGE_POLLS`,
      `DIRECT_MESSAGE_POLLS`
    ]);
    // Bulk delete is guild-only — there is no DM equivalent, so listing
    // DIRECT_MESSAGES here would over-request.
    expect(onMessageDeleteBulk.intents).toEqual([`GUILD_MESSAGES`]);
  });
});
