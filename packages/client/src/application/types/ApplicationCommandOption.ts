import { z } from "zod";
import { channelTypeSchema } from "../../channel/types/ChannelType.js";
import {
  ApplicationCommandOptionType,
  applicationCommandOptionTypeSchema
} from "./ApplicationCommandOptionType.js";
import { localesSchema } from "./Locales.js";
import { applicationCommandOptionChoiceSchema } from "./ApplicationCommandOptionChoice.js";

const applicationCommandOptionBase = z.object({
  /** Type of option */
  type: applicationCommandOptionTypeSchema,
  /** 1-32 character name */
  name: z.string().min(1).max(32),
  /** Localization dictionary for the name field. Values follow the same restrictions as name */
  nameLocalizations: z
    .record(localesSchema, z.string().min(1).max(32))
    .nullish(),
  /** 1-100 character description */
  description: z.string().min(1).max(100),
  /** Localization dictionary for the description field. Values follow the same restrictions as description */
  descriptionLocalizations: z
    .record(localesSchema, z.string().min(1).max(100))
    .nullish(),
  /** If the parameter is required or optional--default false */
  required: z.boolean().nullish().default(false),
  /** Choices for STRING, INTEGER, and NUMBER types for the user to pick from, max 25 */
  choices: applicationCommandOptionChoiceSchema.array().max(25).nullish(),
  /** If the option is a channel type, the channels shown will be restricted to these types */
  channelTypes: channelTypeSchema.array().nullish(),
  /** If autocomplete interactions are enabled for this STRING, INTEGER, or NUMBER type option */
  autocomplete: z.boolean().nullish()
});

const applicationCommandOptionRecursive = applicationCommandOptionBase.extend({
  /** If the option is a subcommand or subcommand group type, these nested options will be the parameters */
  options: z.lazy(() => applicationCommandOptionBase.array().nullish())
});

export const applicationCommandOptionSchema = z.intersection(
  applicationCommandOptionRecursive,
  z.discriminatedUnion(`type`, [
    z.object({
      type: z.literal(ApplicationCommandOptionType.STRING),
      /** For option type STRING, the minimum allowed length (minimum of 0, maximum of 6000) */
      minLength: z.number().int().min(0).max(6000).nullable(),
      /** For option type STRING, the maximum allowed length (minimum of 1, maximum of 6000) */
      maxLength: z.number().int().min(0).max(6000).nullable()
    }),
    z.object({
      type: z.literal(ApplicationCommandOptionType.INTEGER),
      /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
      minValue: z.number().int().nullable(),
      /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
      maxValue: z.number().int().nullable()
    }),
    z.object({
      type: z.literal(ApplicationCommandOptionType.NUMBER),
      /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
      minValue: z.number().nullable(),
      /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
      maxValue: z.number().nullable()
    })
  ])
);

export type ApplicationCommandOption = z.infer<
  typeof applicationCommandOptionSchema
> & {
  options: ApplicationCommandOption[] | null;
};
