import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { onGuildBanAdd } from "../guild/onGuildBanAdd.js";
import { onGuildEmojisUpdate } from "../guild/onGuildEmojisUpdate.js";
import { onGuildMemberAdd } from "../guild/onGuildMemberAdd.js";
import { onGuildMembersChunk } from "../guild/onGuildMembersChunk.js";
import { onGuildRoleDelete } from "../guild/onGuildRoleDelete.js";
import { onSoundboardSounds } from "../guild/onSoundboardSounds.js";
import {
  guildBanSchema,
  guildMemberAddSchema
} from "../guild/types/GuildMemberEvents.js";
import { guildRoleDeleteSchema } from "../guild/types/GuildResourceEvents.js";
import { onPresenceUpdate } from "../presence/onPresenceUpdate.js";
import { onTypingStart } from "../presence/onTypingStart.js";
import { typingStartSchema } from "../presence/types/PresenceEvents.js";

const issuesOf = (result: v.SafeParseResult<v.GenericSchema>): string[] =>
  result.success
    ? []
    : result.issues.map(
        (i) =>
          `${i.path?.map((p) => String(p.key)).join(`.`) ?? `?`}: ${i.message}`
      );

const user = {
  id: `1`,
  username: `u`,
  discriminator: `0001`,
  avatar: null,
  globalName: null
};

describe(`guild member schemas`, () => {
  it(`composes GUILD_MEMBER_ADD from a member plus guildId`, () => {
    // The docs' field table for this event lists ONLY guild_id, because the
    // prose says the payload is a member object with that key added. Reading
    // the table alone would have dropped every member field.
    const payload = {
      user,
      roles: [],
      joinedAt: `2026-08-14T00:00:00+00:00`,
      deaf: false,
      mute: false,
      flags: 0,
      guildId: `2`
    };
    expect(issuesOf(v.safeParse(guildMemberAddSchema, payload))).toEqual([]);
  });

  it(`rejects a member add missing its guildId`, () => {
    const payload = {
      user,
      roles: [],
      joinedAt: `2026-08-14T00:00:00+00:00`,
      deaf: false,
      mute: false,
      flags: 0
    };
    expect(v.safeParse(guildMemberAddSchema, payload).success).toBe(false);
  });

  it(`still requires the member fields, not just guildId`, () => {
    // The distinguishing case. Valibot ignores unknown keys, so a schema of
    // only `{ guildId }` would happily accept a full member payload — the
    // "accepts" test above cannot tell the two apart. Omitting a REQUIRED
    // member field is what proves the member schema is actually composed in.
    expect(v.safeParse(guildMemberAddSchema, { guildId: `2` }).success).toBe(
      false
    );
  });

  it(`accepts a ban with just the guild and user`, () => {
    expect(
      issuesOf(v.safeParse(guildBanSchema, { guildId: `1`, user }))
    ).toEqual([]);
  });
});

describe(`guild resource schemas`, () => {
  it(`carries only ids on role delete`, () => {
    // Unlike create/update there is no role object — it is already gone.
    expect(
      issuesOf(
        v.safeParse(guildRoleDeleteSchema, { guildId: `1`, roleId: `2` })
      )
    ).toEqual([]);
  });
});

describe(`typing start schema`, () => {
  it(`accepts a DM typing event with no guild or member`, () => {
    expect(
      issuesOf(
        v.safeParse(typingStartSchema, {
          channelId: `1`,
          userId: `2`,
          timestamp: 1_755_000_000
        })
      )
    ).toEqual([]);
  });
});

describe(`guild and presence event wiring`, () => {
  it(`subscribes to the documented wire names`, () => {
    expect(onGuildBanAdd.event).toBe(`GUILD_BAN_ADD`);
    expect(onGuildMemberAdd.event).toBe(`GUILD_MEMBER_ADD`);
    expect(onGuildMembersChunk.event).toBe(`GUILD_MEMBERS_CHUNK`);
    expect(onGuildRoleDelete.event).toBe(`GUILD_ROLE_DELETE`);
    expect(onGuildEmojisUpdate.event).toBe(`GUILD_EMOJIS_UPDATE`);
    expect(onSoundboardSounds.event).toBe(`SOUNDBOARD_SOUNDS`);
    expect(onPresenceUpdate.event).toBe(`PRESENCE_UPDATE`);
    expect(onTypingStart.event).toBe(`TYPING_START`);
  });

  it(`reports privileged intents where Discord requires them`, () => {
    // These three are the privileged ones. Getting them wrong means either a
    // fatal 4014 or an event that silently never arrives.
    expect(onGuildMemberAdd.intents).toEqual([`GUILD_MEMBERS`]);
    expect(onPresenceUpdate.intents).toEqual([`GUILD_PRESENCES`]);
  });

  it(`reports no intents for request-response events`, () => {
    // SOUNDBOARD_SOUNDS answers a request the bot made, so Discord always
    // delivers it — claiming an intent would make a bot over-request.
    expect(onSoundboardSounds.intents).toEqual([]);
  });

  it(`gates typing on both the guild and DM typing intents`, () => {
    expect(onTypingStart.intents).toEqual([
      `GUILD_MESSAGE_TYPING`,
      `DIRECT_MESSAGE_TYPING`
    ]);
  });
});
