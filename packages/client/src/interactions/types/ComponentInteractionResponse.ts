import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema, variantSchema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { ComponentType } from "../../components/types/ComponentType.js";
import { type ResolvedData, resolvedDataSchema } from "./ResolvedData.js";

// What Discord sends back for each component of a submitted modal. These are not the components the modal was created with: a response carries the component's `type`, `id` and `customId` and what the user entered, and none of the fields that configured it.

const responseEntries = {
  /** Unique identifier for the component */
  id: boundedInteger(),
  /** Developer-defined identifier for the input; 1-100 characters */
  customId: boundedString({ max: 100 })
};

const _textInputResponseSchema = v.object({
  /** `4` for a Text Input */
  type: v.literal(ComponentType.TextInput),
  ...responseEntries,
  /** The user's input text */
  value: v.string()
});

export interface TextInputResponse extends v.InferOutput<
  typeof _textInputResponseSchema
> {}

/**
 * ### [Text Input Interaction Response](https://discord.com/developers/docs/components/reference#text-input-text-input-interaction-response-structure)
 */
export const textInputResponseSchema = schema<TextInputResponse>(
  _textInputResponseSchema
);

const _stringSelectResponseSchema = v.object({
  /** `3` for a String Select */
  type: v.literal(ComponentType.StringSelect),
  ...responseEntries,
  /** The values of the selected options */
  values: v.array(v.string())
});

export interface StringSelectResponse extends v.InferOutput<
  typeof _stringSelectResponseSchema
> {}

/**
 * ### [String Select Interaction Response](https://discord.com/developers/docs/components/reference#string-select-string-select-interaction-response-structure)
 */
export const stringSelectResponseSchema = schema<StringSelectResponse>(
  _stringSelectResponseSchema
);

const autoPopulatedSelectEntries = {
  ...responseEntries,
  /** IDs of the selected entities */
  values: v.array(snowflake),
  /** Resolved entities from selected options. In a modal submission Discord sends these on the submission's own `resolved` instead. */
  resolved: v.exactOptional(resolvedDataSchema as v.GenericSchema<ResolvedData>)
};

const _userSelectResponseSchema = v.object({
  /** `5` for a User Select */
  type: v.literal(ComponentType.UserSelect),
  ...autoPopulatedSelectEntries
});

export interface UserSelectResponse extends v.InferOutput<
  typeof _userSelectResponseSchema
> {}

/**
 * ### [User Select Interaction Response](https://discord.com/developers/docs/components/reference#user-select-user-select-interaction-response-structure)
 */
export const userSelectResponseSchema = schema<UserSelectResponse>(
  _userSelectResponseSchema
);

const _roleSelectResponseSchema = v.object({
  /** `6` for a Role Select */
  type: v.literal(ComponentType.RoleSelect),
  ...autoPopulatedSelectEntries
});

export interface RoleSelectResponse extends v.InferOutput<
  typeof _roleSelectResponseSchema
> {}

/**
 * ### [Role Select Interaction Response](https://discord.com/developers/docs/components/reference#role-select-role-select-interaction-response-structure)
 */
export const roleSelectResponseSchema = schema<RoleSelectResponse>(
  _roleSelectResponseSchema
);

const _mentionableSelectResponseSchema = v.object({
  /** `7` for a Mentionable Select */
  type: v.literal(ComponentType.MentionableSelect),
  ...autoPopulatedSelectEntries
});

export interface MentionableSelectResponse extends v.InferOutput<
  typeof _mentionableSelectResponseSchema
> {}

/**
 * ### [Mentionable Select Interaction Response](https://discord.com/developers/docs/components/reference#mentionable-select-mentionable-select-interaction-response-structure)
 */
export const mentionableSelectResponseSchema =
  schema<MentionableSelectResponse>(_mentionableSelectResponseSchema);

const _channelSelectResponseSchema = v.object({
  /** `8` for a Channel Select */
  type: v.literal(ComponentType.ChannelSelect),
  ...autoPopulatedSelectEntries
});

export interface ChannelSelectResponse extends v.InferOutput<
  typeof _channelSelectResponseSchema
> {}

/**
 * ### [Channel Select Interaction Response](https://discord.com/developers/docs/components/reference#channel-select-channel-select-interaction-response-structure)
 */
export const channelSelectResponseSchema = schema<ChannelSelectResponse>(
  _channelSelectResponseSchema
);

const _fileUploadResponseSchema = v.object({
  /** `19` for a File Upload */
  type: v.literal(ComponentType.FileUpload),
  ...responseEntries,
  /** IDs of the uploaded files, found in the submission's `resolved.attachments` */
  values: v.array(snowflake)
});

export interface FileUploadResponse extends v.InferOutput<
  typeof _fileUploadResponseSchema
> {}

/**
 * ### [File Upload Interaction Response](https://discord.com/developers/docs/components/reference#file-upload-file-upload-interaction-response-structure)
 */
export const fileUploadResponseSchema = schema<FileUploadResponse>(
  _fileUploadResponseSchema
);

const _radioGroupResponseSchema = v.object({
  /** `21` for a Radio Group */
  type: v.literal(ComponentType.RadioGroup),
  ...responseEntries,
  /** The value of the selected option, or `null` if no option is selected */
  value: v.nullable(v.string())
});

export interface RadioGroupResponse extends v.InferOutput<
  typeof _radioGroupResponseSchema
> {}

/**
 * ### [Radio Group Interaction Response](https://discord.com/developers/docs/components/reference#radio-group-interaction-response-structure)
 */
export const radioGroupResponseSchema = schema<RadioGroupResponse>(
  _radioGroupResponseSchema
);

const _checkboxGroupResponseSchema = v.object({
  /** `22` for a Checkbox Group */
  type: v.literal(ComponentType.CheckboxGroup),
  ...responseEntries,
  /** The values of the selected options, or an empty array if none are selected */
  values: v.array(v.string())
});

export interface CheckboxGroupResponse extends v.InferOutput<
  typeof _checkboxGroupResponseSchema
> {}

/**
 * ### [Checkbox Group Interaction Response](https://discord.com/developers/docs/components/reference#checkbox-group-interaction-response-structure)
 */
export const checkboxGroupResponseSchema = schema<CheckboxGroupResponse>(
  _checkboxGroupResponseSchema
);

const _checkboxResponseSchema = v.object({
  /** `23` for a Checkbox */
  type: v.literal(ComponentType.Checkbox),
  ...responseEntries,
  /** Whether the checkbox is checked */
  value: v.boolean()
});

export interface CheckboxResponse extends v.InferOutput<
  typeof _checkboxResponseSchema
> {}

/**
 * ### [Checkbox Interaction Response](https://discord.com/developers/docs/components/reference#checkbox-interaction-response-structure)
 */
export const checkboxResponseSchema = schema<CheckboxResponse>(
  _checkboxResponseSchema
);

const _textDisplayResponseSchema = v.object({
  /** `10` for a Text Display */
  type: v.literal(ComponentType.TextDisplay),
  /** Unique identifier for the component */
  id: boundedInteger()
});

export interface TextDisplayResponse extends v.InferOutput<
  typeof _textDisplayResponseSchema
> {}

/**
 * ### [Text Display Interaction Response](https://discord.com/developers/docs/components/reference#text-display-text-display-interaction-response-structure)
 */
export const textDisplayResponseSchema = schema<TextDisplayResponse>(
  _textDisplayResponseSchema
);

export type LabelResponseComponent =
  | TextInputResponse
  | StringSelectResponse
  | UserSelectResponse
  | RoleSelectResponse
  | MentionableSelectResponse
  | ChannelSelectResponse
  | FileUploadResponse
  | RadioGroupResponse
  | CheckboxGroupResponse
  | CheckboxResponse;

const _labelResponseSchema = v.object({
  /** `18` for a Label */
  type: v.literal(ComponentType.Label),
  /** Unique identifier for the component */
  id: boundedInteger(),
  /** The response of the component within the label */
  component: variantSchema<LabelResponseComponent>(`type`, [
    textInputResponseSchema,
    stringSelectResponseSchema,
    userSelectResponseSchema,
    roleSelectResponseSchema,
    mentionableSelectResponseSchema,
    channelSelectResponseSchema,
    fileUploadResponseSchema,
    radioGroupResponseSchema,
    checkboxGroupResponseSchema,
    checkboxResponseSchema
  ])
});

export interface LabelResponse extends v.InferOutput<
  typeof _labelResponseSchema
> {}

/**
 * ### [Label Interaction Response](https://discord.com/developers/docs/components/reference#label-label-interaction-response-structure)
 */
export const labelResponseSchema = schema<LabelResponse>(_labelResponseSchema);

const _actionRowResponseSchema = v.object({
  /** `1` for an Action Row */
  type: v.literal(ComponentType.ActionRow),
  /** Unique identifier for the component */
  id: v.exactOptional(boundedInteger()),
  /** The text input the row holds; a legacy modal puts one text input in each row */
  components: v.array(textInputResponseSchema)
});

export interface ActionRowResponse extends v.InferOutput<
  typeof _actionRowResponseSchema
> {}

/**
 * The action row of a legacy modal submission, holding the response of its text input. Discord does not document a response structure for action rows; this follows the shape legacy modal submissions arrive in.
 */
export const actionRowResponseSchema = schema<ActionRowResponse>(
  _actionRowResponseSchema
);

export type ModalSubmitComponent =
  | LabelResponse
  | TextDisplayResponse
  | ActionRowResponse;

/**
 * ### [Component Interaction Response](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-component-interaction-response-structures)
 *
 * A top-level component of a submitted modal: a Label wrapping the response of its component, a Text Display, or, in a legacy modal, an Action Row holding a text input.
 */
export const modalSubmitComponentSchema = variantSchema<ModalSubmitComponent>(
  `type`,
  [labelResponseSchema, textDisplayResponseSchema, actionRowResponseSchema]
);
