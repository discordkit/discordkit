// https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send

import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { emojiSchema } from "@discordkit/client/emoji/types/Emoji";

/**
 * ### [Animation Types](https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types)
 */
export enum VoiceEffectAnimationType {
  /** A fun animation, sent by a Nitro subscriber */
  PREMIUM = 0,
  /** The standard animation */
  BASIC = 1
}

export const voiceEffectAnimationTypeSchema = v.enum_(VoiceEffectAnimationType);

const _voiceChannelEffectSendSchema = v.object({
  /** ID of the channel the effect was sent in */
  channelId: snowflake,
  /** ID of the guild the effect was sent in */
  guildId: snowflake,
  /** ID of the user who sent the effect */
  userId: snowflake,
  /** The emoji sent, for emoji reaction and soundboard effects */
  emoji: v.optional(v.nullable(emojiSchema)),
  /** The type of emoji animation, for emoji reaction and soundboard effects */
  animationType: v.optional(v.nullable(voiceEffectAnimationTypeSchema)),
  /** The id of the emoji animation, for emoji reaction and soundboard effects */
  animationId: v.optional(v.number()),
  /**
   * The id of the soundboard sound. Documented as "snowflake or integer" —
   * default sounds use small integers while custom ones use snowflakes.
   */
  soundId: v.optional(v.union([snowflake, v.number()])),
  /** The volume of the soundboard sound, from 0 to 1 */
  soundVolume: v.optional(v.number())
});

export interface VoiceChannelEffectSend extends v.InferOutput<
  typeof _voiceChannelEffectSendSchema
> {}

/**
 * ### [Voice Channel Effect Send](https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send)
 */
export const voiceChannelEffectSendSchema = schema<VoiceChannelEffectSend>(
  _voiceChannelEffectSendSchema
);

const _voiceServerUpdateSchema = v.object({
  /** Voice connection token */
  token: v.string(),
  /** Guild this voice server update is for */
  guildId: snowflake,
  /** Voice server host */
  endpoint: v.nullable(v.string())
});

export interface VoiceServerUpdate extends v.InferOutput<
  typeof _voiceServerUpdateSchema
> {}

/**
 * ### [Voice Server Update](https://discord.com/developers/docs/events/gateway-events#voice-server-update)
 *
 * A `null` endpoint means the server is being reallocated — wait for the next
 * event rather than attempting to connect.
 *
 * Never gated by an intent: it answers a Voice State Update you sent.
 */
export const voiceServerUpdateSchema = schema<VoiceServerUpdate>(
  _voiceServerUpdateSchema
);
