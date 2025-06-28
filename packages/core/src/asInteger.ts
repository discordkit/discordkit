import type {
  CustomSchema,
  IntegerAction,
  SchemaWithPipe,
  TransformAction
} from "valibot";
import { integer, pipe, transform } from "valibot";
import type { bitfield } from "./bitfield.js";

export const asInteger = (
  schema: ReturnType<typeof bitfield>
): SchemaWithPipe<
  readonly [
    CustomSchema<string | number | bigint, string>,
    TransformAction<string | number | bigint, number>,
    IntegerAction<number, undefined>
  ]
> =>
  pipe(
    schema,
    transform((val) => parseInt(val.toString(), 10)),
    integer()
  );
