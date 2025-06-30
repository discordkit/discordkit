import {
  pipe,
  string,
  minLength,
  maxLength,
  number,
  minValue,
  maxValue,
  type InferOutput
} from "valibot";
import { toValidated } from "../toValidated.js";

describe(`toValidated`, () => {
  const actual = async (i, o) =>
    toValidated(
      async (_: InferOutput<typeof i>) => Promise.resolve(o),
      pipe(string(), minLength(1), maxLength(5)),
      pipe(number(), minValue(1), maxValue(5))
    )(i);

  it(`validates the input and return values of the provided fetcher function`, async () => {
    await expect(actual(`valid`, 5)).resolves.not.toThrow();
    await expect(actual(`invalid`, 5)).rejects.toThrow();
    await expect(actual(`valid`, 10)).rejects.toThrow();
  });
});
