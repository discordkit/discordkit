import * as v from "valibot";
import { schema, snowflake } from "@discordkit/core";

const _userSelectDefaultValueSchema = v.object({
  /** ID of the user */
  id: snowflake,
  /** discriminator */
  type: v.literal(`user`)
});

export interface UserSelectDefaultValue extends v.InferOutput<
  typeof _userSelectDefaultValueSchema
> {}

export const userSelectDefaultValueSchema = schema<UserSelectDefaultValue>(
  _userSelectDefaultValueSchema
);

const _roleSelectDefaultValueSchema = v.object({
  /** ID of the role */
  id: snowflake,
  /** discriminator */
  type: v.literal(`role`)
});

export interface RoleSelectDefaultValue extends v.InferOutput<
  typeof _roleSelectDefaultValueSchema
> {}

export const roleSelectDefaultValueSchema = schema<RoleSelectDefaultValue>(
  _roleSelectDefaultValueSchema
);

const _mentionableSelectDefaultValueSchema = v.object({
  /** ID of the user or role */
  id: snowflake,
  /** discriminator (`user` or `role`) */
  type: v.picklist([`user`, `role`])
});

export interface MentionableSelectDefaultValue extends v.InferOutput<
  typeof _mentionableSelectDefaultValueSchema
> {}

export const mentionableSelectDefaultValueSchema =
  schema<MentionableSelectDefaultValue>(_mentionableSelectDefaultValueSchema);

const _channelSelectDefaultValueSchema = v.object({
  /** ID of the channel */
  id: snowflake,
  /** discriminator */
  type: v.literal(`channel`)
});

export interface ChannelSelectDefaultValue extends v.InferOutput<
  typeof _channelSelectDefaultValueSchema
> {}

export const channelSelectDefaultValueSchema =
  schema<ChannelSelectDefaultValue>(_channelSelectDefaultValueSchema);

/**
 * ### [Select Default Value](https://discord.com/developers/docs/components/reference#user-select-select-default-value-structure)
 *
 * Default-value entry for an auto-populated select menu. Discord
 * picks a narrower shape per select kind; prefer
 * {@link UserSelectDefaultValue}, {@link RoleSelectDefaultValue},
 * {@link MentionableSelectDefaultValue}, or
 * {@link ChannelSelectDefaultValue} when working with a specific
 * select component.
 */
export type SelectDefaultValue =
  | UserSelectDefaultValue
  | RoleSelectDefaultValue
  | ChannelSelectDefaultValue;

/**
 * Union of every possible select default value shape, kept as a
 * narrow re-export for downstream APIs that still consume the broad
 * shape. New code should use the per-select variant schemas.
 */
export const selectDefaultValueSchema = v.union([
  _userSelectDefaultValueSchema,
  _roleSelectDefaultValueSchema,
  _channelSelectDefaultValueSchema
]) as v.GenericSchema<SelectDefaultValue>;
