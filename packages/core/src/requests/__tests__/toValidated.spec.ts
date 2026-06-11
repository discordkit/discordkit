import { describe, it, expect } from "vite-plus/test";
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
  describe(`with both input and output schemas`, () => {
    const input = pipe(string(), minLength(1), maxLength(5));
    const output = pipe(number(), minValue(1), maxValue(5));
    const wrap = async (i: string, o: unknown) =>
      toValidated(
        async (_: InferOutput<typeof input>) => Promise.resolve(o),
        input,
        output
      )(i);

    it(`resolves when both input and output satisfy their schemas`, async () => {
      await expect(wrap(`valid`, 5)).resolves.toBe(5);
    });

    it(`rejects when input fails its schema`, async () => {
      await expect(wrap(`too-long`, 5)).rejects.toThrow();
    });

    it(`rejects when output fails its schema`, async () => {
      await expect(wrap(`valid`, 10)).rejects.toThrow();
    });
  });

  describe(`with only an input schema`, () => {
    const input = pipe(string(), minLength(3));
    const wrap = async (i: string) =>
      toValidated(async (_: string) => Promise.resolve(undefined), input)(i);

    it(`resolves when input satisfies its schema`, async () => {
      await expect(wrap(`abc`)).resolves.toBeUndefined();
    });

    it(`rejects when input fails its schema`, async () => {
      await expect(wrap(`ab`)).rejects.toThrow();
    });
  });

  describe(`with only an output schema`, () => {
    const output = pipe(number(), minValue(0));
    const wrap = async (o: unknown) =>
      toValidated(async () => Promise.resolve(o), null, output)();

    it(`resolves when output satisfies its schema`, async () => {
      await expect(wrap(42)).resolves.toBe(42);
    });

    it(`rejects when output fails its schema`, async () => {
      await expect(wrap(-1)).rejects.toThrow();
    });
  });

  describe(`with no schemas`, () => {
    it(`acts as a passthrough proxy`, async () => {
      const sentinel = Symbol(`sentinel`);
      const fn = toValidated(async () => sentinel);
      await expect(fn()).resolves.toBe(sentinel);
    });
  });
});
