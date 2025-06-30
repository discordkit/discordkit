import type {
  CustomSchema,
  DigitsAction,
  SchemaWithPipe,
  TransformAction
} from "valibot";
import { digits, pipe, transform } from "valibot";
import type { bitfield } from "./bitfield.js";

export const asDigits = (
  schema: ReturnType<typeof bitfield>
): SchemaWithPipe<
  readonly [
    CustomSchema<string | number | bigint, string>,
    TransformAction<string | number | bigint, string>,
    DigitsAction<string, undefined>
  ]
> =>
  pipe(
    schema,
    transform((val) => val.toString()),
    digits()
  );
