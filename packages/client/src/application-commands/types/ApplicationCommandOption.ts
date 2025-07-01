import {
  type GenericSchema,
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
  lazy,
  intersect,
  type InferOutput,
  union,
  variant,
  pipe
} from "valibot";
import { channelTypeSchema } from "../../channel/types/ChannelType.js";
import {
  ApplicationCommandOptionType,
  applicationCommandOptionTypeSchema
} from "./ApplicationCommandOptionType.js";
import { localesSchema } from "../../application/types/Locales.js";
import { applicationCommandOptionChoiceSchema } from "./ApplicationCommandOptionChoice.js";

export const applicationCommandOptionSchema = intersect([
  object({
    /** 1-32 character name */
    name: pipe(string(), minLength(1), maxLength(32)) as GenericSchema<string>,
    /** Localization dictionary for the name field. Values follow the same restrictions as name */
    nameLocalizations: nullish(
      record(
        localesSchema,
        pipe(string(), minLength(1), maxLength(32)) as GenericSchema<string>
      )
    ),
    /** 1-100 character description */
    description: pipe(
      string(),
      minLength(1),
      maxLength(100)
    ) as GenericSchema<string>,
    /** Localization dictionary for the description field. Values follow the same restrictions as description */
    descriptionLocalizations: nullish(
      record(
        localesSchema,
        pipe(string(), minLength(1), maxLength(100)) as GenericSchema<string>
      )
    ),
    /** If the parameter is required or optional--default false */
    required: nullish(boolean()),
    /** Choices for STRING, INTEGER, and NUMBER types for the user to pick from, max 25 */
    choices: nullish(
      pipe(array(applicationCommandOptionChoiceSchema), maxLength(25))
    ),
    /** If the option is a channel type, the channels shown will be restricted to these types */
    channelTypes: nullish(array(channelTypeSchema)),
    /** If autocomplete interactions are enabled for this STRING, INTEGER, or NUMBER type option */
    autocomplete: nullish(boolean())
  }),
  union([
    object({
      /** Type of option */
      type: applicationCommandOptionTypeSchema
    }),
    variant(`type`, [
      object({
        type: union([
          literal(ApplicationCommandOptionType.SUB_COMMAND),
          literal(ApplicationCommandOptionType.SUB_COMMAND_GROUP)
        ]),
        /** If the option is a subcommand or subcommand group type, these nested options will be the parameters */
        options: lazy(
          (): GenericSchema<unknown[] | null | undefined> =>
            nullish(array(applicationCommandOptionSchema))
        )
      }),
      object({
        type: literal(ApplicationCommandOptionType.STRING),
        /** For option type STRING, the minimum allowed length (minimum of 0, maximum of 6000) */
        minLength: nullable<GenericSchema<number>>(
          pipe(number(), integer(), minValue(0), maxValue(6000))
        ),
        /** For option type STRING, the maximum allowed length (minimum of 1, maximum of 6000) */
        maxLength: nullable<GenericSchema<number>>(
          pipe(number(), integer(), minValue(0), maxValue(6000))
        )
      }),
      object({
        type: literal(ApplicationCommandOptionType.INTEGER),
        /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
        minValue: nullable<GenericSchema<number>>(pipe(number(), integer())),
        /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
        maxValue: nullable<GenericSchema<number>>(pipe(number(), integer()))
      }),
      object({
        type: literal(ApplicationCommandOptionType.NUMBER),
        /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
        minValue: nullable(number()),
        /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
        maxValue: nullable(number())
      })
    ])
  ])
]);

export type ApplicationCommandOption = InferOutput<
  typeof applicationCommandOptionSchema
>;
