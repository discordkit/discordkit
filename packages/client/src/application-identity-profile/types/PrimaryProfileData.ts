import * as v from "valibot";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { profileMediaSchema } from "./ProfileMedia.js";

const _primaryProfileDataSchema = v.object({
  /** current season name (e.g. "Season 3") */
  season: v.exactOptional(boundedString({ max: 100 })),
  /** current rank name (e.g. "Silver") */
  rankName: v.exactOptional(boundedString({ max: 100 })),
  /** image representing the current rank */
  rankImage: v.exactOptional(profileMediaSchema),
  /** highest rank achieved */
  highestRank: v.exactOptional(boundedString({ max: 100 })),
  /** image representing the highest rank achieved */
  highestRankImage: v.exactOptional(profileMediaSchema),
  /** name of the featured played character */
  featuredPlayedCharacter: v.exactOptional(boundedString({ max: 100 })),
  /** image of the featured played character */
  featuredPlayedCharacterImage: v.exactOptional(profileMediaSchema),
  /** total playtime in hours; accepts decimal values (e.g. `69.41`) */
  playtimeHours: v.exactOptional(v.pipe(v.number(), v.minValue(0))),
  /** total number of wins */
  totalWins: v.exactOptional(boundedInteger()),
  /** wins in the current period (e.g. season) */
  currentPeriodWins: v.exactOptional(boundedInteger()),
  /** total number of games played */
  totalGames: v.exactOptional(boundedInteger()),
  /** games played in the current period */
  currentPeriodGames: v.exactOptional(boundedInteger()),
  /** total number of kills */
  totalKills: v.exactOptional(boundedInteger()),
  /** kills in the current period */
  currentPeriodKills: v.exactOptional(boundedInteger()),
  /** total number of assists */
  totalAssists: v.exactOptional(boundedInteger()),
  /** assists in the current period */
  currentPeriodAssists: v.exactOptional(boundedInteger()),
  /** total number of deaths */
  totalDeaths: v.exactOptional(boundedInteger()),
  /** deaths in the current period */
  currentPeriodDeaths: v.exactOptional(boundedInteger())
});

export interface PrimaryProfileData extends v.InferOutput<
  typeof _primaryProfileDataSchema
> {}

/**
 * ### [Primary Profile Data](https://discord.com/developers/docs/resources/application-identity-profile#primary-profile-data-object)
 *
 * Pre-configured fields meant to be generic across many games. All fields are optional. String values are limited to 100 characters.
 */
export const primaryProfileDataSchema = schema<PrimaryProfileData>(
  _primaryProfileDataSchema
);
