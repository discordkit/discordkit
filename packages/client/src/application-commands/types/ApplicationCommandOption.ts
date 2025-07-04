import * as v from "valibot";
import { boundedArray, boundedString, boundedInteger } from "@discordkit/core";
import { channelTypeSchema } from "../../channel/types/ChannelType.js";
import {
  ApplicationCommandOptionType,
  applicationCommandOptionTypeSchema
} from "./ApplicationCommandOptionType.js";
import type { Locales } from "../../application/types/Locales.js";
import { localesSchema } from "../../application/types/Locales.js";
import { applicationCommandOptionChoiceSchema } from "./ApplicationCommandOptionChoice.js";

export const applicationCommandOptionSchema = v.intersect([
  v.object({
    /** 1-32 character name */
    name: boundedString({ max: 32 }),
    /** Localization dictionary for the name field. Values follow the same restrictions as name */
    nameLocalizations: v.nullish(
      v.record(localesSchema, boundedString({ max: 32 })) as v.GenericSchema<
        Record<Locales, string>
      >
    ),
    /** 1-100 character description */
    description: boundedString({ max: 100 }),
    /** Localization dictionary for the description field. Values follow the same restrictions as description */
    descriptionLocalizations: v.nullish(
      v.record(localesSchema, boundedString({ max: 100 })) as v.GenericSchema<
        Record<Locales, string>
      >
    ),
    /** If the parameter is required or optional--default false */
    required: v.nullish(v.boolean()),
    /** Choices for STRING, INTEGER, and NUMBER types for the user to pick from, max 25 */
    choices: v.nullish(
      boundedArray(applicationCommandOptionChoiceSchema, { max: 25 })
    ),
    /** If the option is a channel type, the channels shown will be restricted to these types */
    channelTypes: v.nullish(v.array(channelTypeSchema)),
    /** If autocomplete interactions are enabled for this STRING, INTEGER, or NUMBER type option */
    autocomplete: v.nullish(v.boolean())
  }),
  v.union([
    v.object({
      /** Type of option */
      type: applicationCommandOptionTypeSchema
    }),
    v.variant(`type`, [
      v.object({
        type: v.union([
          v.literal(ApplicationCommandOptionType.SUB_COMMAND),
          v.literal(ApplicationCommandOptionType.SUB_COMMAND_GROUP)
        ]),
        /** If the option is a subcommand or subcommand group type, these nested options will be the parameters */
        options: v.lazy(
          (): v.GenericSchema<unknown[] | null | undefined> =>
            v.nullish(v.array(applicationCommandOptionSchema))
        )
      }),
      v.object({
        type: v.literal(ApplicationCommandOptionType.STRING),
        /** For option type STRING, the minimum allowed length (minimum of 0, maximum of 6000) */
        minLength: v.nullable(boundedInteger({ max: 6000 })),
        /** For option type STRING, the maximum allowed length (minimum of 1, maximum of 6000) */
        maxLength: v.nullable(boundedInteger({ max: 6000 }))
      }),
      v.object({
        type: v.literal(ApplicationCommandOptionType.INTEGER),
        /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
        minValue: v.nullable(boundedInteger()),
        /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
        maxValue: v.nullable(boundedInteger())
      }),
      v.object({
        type: v.literal(ApplicationCommandOptionType.NUMBER),
        /** If the option is an INTEGER or NUMBER type, the minimum value permitted */
        minValue: v.nullable(v.number()),
        /** If the option is an INTEGER or NUMBER type, the maximum value permitted */
        maxValue: v.nullable(v.number())
      })
    ])
  ])
]);

export type ApplicationCommandOption = v.InferOutput<
  typeof applicationCommandOptionSchema
>;
