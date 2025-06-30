import type { InferOutput } from "valibot";
import {
  integer,
  maxValue,
  minValue,
  nullable,
  number,
  object,
  pipe
} from "valibot";

/**
 * This object will always be filled with `primaryColor` being the role's `color`. Other fields can only be set to a non-null value if the guild has the `ENHANCED_ROLE_COLORS` guild feature.
 *
 * > [!NOTE]
 * >
 * > When sending `tertiaryColor` the API enforces the role color to be a holographic style with values of: `primaryColor = 11127295`, `secondaryColor = 16759788`, and `tertiaryColor = 16761760.`
 */
export const roleColorsSchema = object({
  primaryColor: pipe(
    number(),
    integer(),
    minValue(0x000000),
    maxValue(0xffffff)
  ),
  secondaryColor: nullable(
    pipe(number(), integer(), minValue(0x000000), maxValue(0xffffff))
  ),
  tertiaryColor: nullable(
    pipe(number(), integer(), minValue(0x000000), maxValue(0xffffff))
  )
});

export type RoleColors = InferOutput<typeof roleColorsSchema>;
