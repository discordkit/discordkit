import {
  custom,
  pipe,
  title,
  type SchemaWithPipe,
  type TitleAction,
  type CustomSchema
} from "valibot";
import { isNonNullable } from "./isNonNullable.js";

export interface Flags {
  [key: string]: number | bigint | string;
}

export const bitfield = <TName extends string>(
  name: TName,
  flags: Flags,
  message: string = `Invalid Bitfield`
): SchemaWithPipe<
  readonly [
    CustomSchema<string | number | bigint, string>,
    TitleAction<string | number | bigint, TName>
  ]
> => {
  // because enums are bidirectionally indexed, pick only the numerical values
  const flagValues = Object.values(flags).filter(
    // flag enums have numerical values, so remove all the key name strings
    (flag) => !isNaN(Number(flag))
  );
  if (!flagValues.every((flag) => typeof flag === typeof flagValues[0])) {
    throw new Error(`Provided Flags enum must contain values of the same type`);
  }
  // combine the flags to create a validation mask
  const mask = flagValues.reduce<bigint>(
    (total, flag) => total | BigInt(flag),
    0n
  );
  return pipe(
    custom<number | bigint | string, typeof message>(
      (val) =>
        // short-circuit on null + undefined
        isNonNullable(val) &&
        // only work on supported types
        (typeof val === `number` ||
          typeof val === `bigint` ||
          typeof val === `string`)
          ? // validate the value against the given flags
            (BigInt(val) & mask) === BigInt(val)
          : false,
      message
    ),
    title(name)
  );
};
