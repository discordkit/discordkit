import {
  pipe,
  array,
  object,
  string,
  minLength,
  maxLength,
  type InferOutput
} from "valibot";
import { initTRPC } from "@trpc/server";
import { MockUtils } from "#mock-utils";
import { type Fetcher, get } from "../methods.js";
import { toProcedure } from "../toProcedure.js";
import { discord } from "../DiscordSession.js";
import { bitfield } from "../bitfield.js";
import { snowflake } from "../snowflake.js";
import { asDigits } from "../asDigits.js";

const Permissions = {
  CREATE_INSTANT_INVITE: 0x0000000000000001,
  KICK_MEMBERS: 0x0000000000000002,
  BAN_MEMBERS: 0x0000000000000004,
  ADMINISTRATOR: 0x0000000000000008,
  MANAGE_CHANNELS: 0x0000000000000010,
  MANAGE_GUILD: 0x0000000000000020,
  ADD_REACTIONS: 0x0000000000000040,
  VIEW_AUDIT_LOG: 0x0000000000000080,
  PRIORITY_SPEAKER: 0x0000000000000100,
  STREAM: 0x0000000000000200,
  VIEW_CHANNEL: 0x0000000000000400,
  SEND_MESSAGES: 0x0000000000000800,
  SEND_TTS_MESSAGES: 0x0000000000001000,
  MANAGE_MESSAGES: 0x0000000000002000,
  EMBED_LINKS: 0x0000000000004000,
  ATTACH_FILES: 0x0000000000008000,
  READ_MESSAGE_HISTORY: 0x0000000000010000,
  MENTION_EVERYONE: 0x0000000000020000,
  USE_EXTERNAL_EMOJIS: 0x0000000000040000,
  VIEW_GUILD_INSIGHTS: 0x0000000000080000,
  CONNECT: 0x0000000000100000,
  SPEAK: 0x0000000000200000,
  MUTE_MEMBERS: 0x0000000000400000,
  DEAFEN_MEMBERS: 0x0000000000800000,
  MOVE_MEMBERS: 0x0000000001000000,
  USE_VAD: 0x0000000002000000,
  CHANGE_NICKNAME: 0x0000000004000000,
  MANAGE_NICKNAMES: 0x0000000008000000,
  MANAGE_ROLES: 0x0000000010000000,
  MANAGE_WEBHOOKS: 0x0000000020000000,
  MANAGE_GUILD_EXPRESSIONS: 0x0000000040000000,
  USE_APPLICATION_COMMANDS: 0x0000000080000000,
  REQUEST_TO_SPEAK: 0x0000000100000000,
  MANAGE_EVENTS: 0x0000000200000000,
  MANAGE_THREADS: 0x0000000400000000,
  CREATE_PUBLIC_THREADS: 0x0000000800000000,
  CREATE_PRIVATE_THREADS: 0x0000001000000000,
  USE_EXTERNAL_STICKERS: 0x0000002000000000,
  SEND_MESSAGES_IN_THREADS: 0x0000004000000000,
  USE_EMBEDDED_ACTIVITIES: 0x0000008000000000,
  MODERATE_MEMBERS: 0x0000010000000000,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 0x0000020000000000,
  USE_SOUNDBOARD: 0x0000040000000000,
  CREATE_GUILD_EXPRESSIONS: 0x0000080000000000,
  CREATE_EVENTS: 0x0000100000000000,
  USE_EXTERNAL_SOUNDS: 0x0000200000000000,
  SEND_VOICE_MESSAGES: 0x0000400000000000,
  SEND_POLLS: 0x0002000000000000,
  USE_EXTERNAL_APPS: 0x0004000000000000
} as const;

const permissionFlag = bitfield(`permission`, Permissions);

describe(`toProcedure`, () => {
  const mockUtils = new MockUtils(discord, {
    customMocks: (schema): unknown => {
      if (MockUtils.titlesMatch(schema, snowflake)) {
        return MockUtils.uid.getUniqueID().toString();
      }
      if (MockUtils.titlesMatch(schema, permissionFlag)) {
        return MockUtils.applyTransforms(schema, MockUtils.flags(Permissions));
      }
    }
  });
  const userSchema = object({
    id: snowflake,
    username: pipe(string(), minLength(2), maxLength(16)),
    permissions: asDigits(permissionFlag)
  });
  const { expected } = mockUtils.request.get(
    `/listUsers`,
    null,
    array(userSchema)
  );

  it(`is tRPC compatible`, async () => {
    const tRPC = initTRPC.create();
    const listUsers: Fetcher<
      null,
      Array<InferOutput<typeof userSchema>>
    > = async () => get(`/listUsers`);
    const listUsersProcedure = toProcedure(
      `query`,
      listUsers,
      null,
      array(userSchema)
    );

    await expect(
      tRPC
        .router({
          listUsers: listUsersProcedure(tRPC.procedure)
        })
        .createCaller({})
        .listUsers()
    ).resolves.toStrictEqual(expected);
  });
});
