import {
  object,
  string,
  minLength,
  maxLength,
  record,
  nullish,
  boolean,
  nullable,
  number,
  literal,
  integer,
  minValue,
  maxValue,
  array,
  recursive,
  intersection,
  type Output,
  union
} from "valibot";
import { channelTypeSchema } from "../../channel/types/ChannelType.js";
import {
  ApplicationCommandOptionType,
  applicationCommandOptionTypeSchema
} from "./ApplicationCommandOptionType.js";
import { localesSchema } from "./Locales.js";
import { applicationCommandOptionChoiceSchema } from "./ApplicationCommandOptionChoice.js";

const applicationCommandOptionBase = object({
  /** Type of option */
  type: applicationCommandOptionTypeSchema,
  /** 1-32 character name */
  name: string([minLength(1), maxLength(32)]),
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: nullish(
    record(localesSchema, string([minLength(1), maxLength(32)]))
  ),
  /** 1-100 character description */
  description: string([minLength(1), maxLength(100)]),
  /** Localization dictionary for the description field. Values follow the same restrictions as description */
  descriptionLocalizations: nullish(
    record(localesSchema, string([minLength(1), maxLength(100)]))
  ),
  /** If the parameter is required or optional--default false */
  required: nullish(boolean(), false),
  /** Choices for STRING, INTEGER, and NUMBER types for the user to pick from, max 25 */
  choices: nullish(
    array(applicationCommandOptionChoiceSchema, [maxLength(25)])
  ),
  /** If the option is a channel type, the channels shown will be restricted to these types */
  channelTypes: nullish(array(channelTypeSchema)),
  /** If autocomplete interactions are enabled for this STRING, INTEGER, or NUMBER type option */
  autocomplete: nullish(boolean())
});

export const applicationCommandOptionSchema = intersection([
  applicationCommandOptionBase,
  union([
    object({
      type: union([
        literal(ApplicationCommandOptionType.SUB_COMMAND),
        literal(ApplicationCommandOptionType.SUB_COMMAND_GROUP)
      ]),
      /** If the option is a subcommand or subcommand group type, these nested options will be the parameters */
      options: recursive(() => nullish(array(applicationCommandOptionBase)))
    }),
    object({
      type: literal(ApplicationCommandOptionType.STRING),
      /** For option type STRING, the minimum allowed length (minimum of 0, maximum of 6000) */
      minLength: nullable(number([integer(), minValue(0), maxValue(6000)])),
      /** For option type STRING, the maximum allowed length (minimum of 1, maximum of 6000) */
      maxLength: nullable(number([integer(), minValue(1), maxValue(6000)]))
    }),
    object({
      type: literal(ApplicationCommandOptionType.INTEGER),
      /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
      minValue: nullable(number([integer()])),
      /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
      maxValue: nullable(number([integer()]))
    }),
    object({
      type: literal(ApplicationCommandOptionType.NUMBER),
      /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
      minValue: nullable(number()),
      /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
      maxValue: nullable(number())
    })
  ])
]);

export type ApplicationCommandOption = Output<
  typeof applicationCommandOptionSchema
>;
