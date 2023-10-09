import { boolean, nullish, object } from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const modifyUserVoiceStateSchema = object({
  guild: snowflake,
  user: snowflake,
  body: object({
    /** the id of the channel the user is currently in */
    channelId: snowflake,
    /** toggles the user's suppress state */
    suppress: nullish(boolean())
  })
});

/**
 * ### [Modify User Voice State](https://discord.com/developers/docs/resources/guild#modify-user-voice-state)
 *
 * **PATCH** `/guilds/:guild/voice-states/:user`
 *
 * Updates another user's voice state. Fires a Voice State Update Gateway event.
 */
export const modifyUserVoiceState: Fetcher<
  typeof modifyUserVoiceStateSchema
> = async ({ guild, user, body }) =>
  patch(`/guilds/${guild}/voice-states/${user}`, body);

export const modifyUserVoiceStateSafe = toValidated(
  modifyUserVoiceState,
  modifyUserVoiceStateSchema
);

export const modifyUserVoiceStateProcedure = toProcedure(
  `mutation`,
  modifyUserVoiceState,
  modifyUserVoiceStateSchema
);
