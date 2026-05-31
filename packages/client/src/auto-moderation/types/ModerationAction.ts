import * as v from "valibot";
import {
  snowflake,
  boundedInteger,
  boundedString,
  schema,
  variantSchema
} from "@discordkit/core";
import { ModerationActionType } from "./ModerationActionType.js";

const _blockMessageActionSchema = v.object({
  /** the type of action */
  type: v.literal(ModerationActionType.BLOCK_MESSAGE),
  /** additional metadata for the BLOCK_MESSAGE action */
  metadata: v.exactOptional(
    v.object({
      /** additional explanation that will be shown to members whenever their message is blocked */
      customMessage: v.nullish(boundedString({ max: 150 }))
    })
  )
});

export interface BlockMessageAction extends v.InferOutput<
  typeof _blockMessageActionSchema
> {}

/**
 * ### [Block Message Action](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * Blocks a member's message and prevents it from being posted. A
 * custom explanation can be shown to members whenever their message
 * is blocked.
 */
export const blockMessageActionSchema = schema<BlockMessageAction>(
  _blockMessageActionSchema
);

const _sendAlertMessageActionSchema = v.object({
  /** the type of action */
  type: v.literal(ModerationActionType.SEND_ALERT_MESSAGE),
  /** required metadata for SEND_ALERT_MESSAGE */
  metadata: v.object({
    /** channel to which user content should be logged */
    channelId: snowflake
  })
});

export interface SendAlertMessageAction extends v.InferOutput<
  typeof _sendAlertMessageActionSchema
> {}

/**
 * ### [Send Alert Message Action](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * Logs the offending user content to a specified channel.
 */
export const sendAlertMessageActionSchema = schema<SendAlertMessageAction>(
  _sendAlertMessageActionSchema
);

const _timeoutActionSchema = v.object({
  /** the type of action */
  type: v.literal(ModerationActionType.TIMEOUT),
  /** required metadata for TIMEOUT */
  metadata: v.object({
    /** timeout duration in seconds (max 2419200 — 4 weeks) */
    durationSeconds: boundedInteger({ max: 2419200 })
  })
});

export interface TimeoutAction extends v.InferOutput<
  typeof _timeoutActionSchema
> {}

/**
 * ### [Timeout Action](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * Times the user out for a specified duration.
 */
export const timeoutActionSchema = schema<TimeoutAction>(_timeoutActionSchema);

const _blockMemberInteractionActionSchema = v.object({
  /** the type of action */
  type: v.literal(ModerationActionType.BLOCK_MEMBER_INTERACTION)
});

export interface BlockMemberInteractionAction extends v.InferOutput<
  typeof _blockMemberInteractionActionSchema
> {}

/**
 * ### [Block Member Interaction Action](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * Prevents a member from using text, voice, or other interactions
 * within the server.
 */
export const blockMemberInteractionActionSchema =
  schema<BlockMemberInteractionAction>(_blockMemberInteractionActionSchema);

export type ModerationAction =
  | BlockMessageAction
  | SendAlertMessageAction
  | TimeoutAction
  | BlockMemberInteractionAction;

/**
 * ### [Moderation Action](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object)
 *
 * An action which will execute whenever a rule is triggered.
 * Discriminated by `type`, with metadata typed per action kind.
 */
export const moderationActionSchema = variantSchema<ModerationAction>(`type`, [
  _blockMessageActionSchema,
  _sendAlertMessageActionSchema,
  _timeoutActionSchema,
  _blockMemberInteractionActionSchema
]);
