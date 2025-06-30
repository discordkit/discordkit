import type { CheckAction } from "valibot";
import { check } from "valibot";
import { extractDataURIMetadata, toBase64 } from "./datauri.js";

export const hasSize = (
  size: number | { min?: number; max?: number },
  message = `Data URI is the incorrect size` as const
): CheckAction<string, typeof message> =>
  check((dataURI: string) => {
    const { data } = extractDataURIMetadata(dataURI);

    if (typeof data === `undefined`) {
      throw new Error(`Received badly formatted Data URI`);
    }

    const actual = toBase64(data).length;
    return typeof size === `number`
      ? size === actual
      : actual >= (size.min ?? 0) && actual <= (size.max ?? Infinity);
  }, message);
