import * as v from "valibot";
import { boundedInteger } from "@discordkit/core";

/**
 * This object will always be filled with `primaryColor` being the role's `color`. Other fields can only be set to a non-null value if the guild has the `ENHANCED_ROLE_COLORS` guild feature.
 *
 * > [!NOTE]
 * >
 * > When sending `tertiaryColor` the API enforces the role color to be a holographic style with values of: `primaryColor = 11127295`, `secondaryColor = 16759788`, and `tertiaryColor = 16761760.`
 */
export const roleColorsSchema = v.object({
  primaryColor: boundedInteger({ min: 0x000000, max: 0xffffff }),
  secondaryColor: v.nullable(boundedInteger({ min: 0x000000, max: 0xffffff })),
  tertiaryColor: v.nullable(boundedInteger({ min: 0x000000, max: 0xffffff }))
});

export interface RoleColors extends v.InferOutput<typeof roleColorsSchema> {}
