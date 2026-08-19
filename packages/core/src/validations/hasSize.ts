import type { CheckAction } from "valibot";
import { check } from "valibot";
import { extractDataURIMetadata, toBase64 } from "./datauri.js";

/** @__NO_SIDE_EFFECTS__ */
export const hasSize = <
  TMessage extends string = `Data URI is the incorrect size`
>(
  size: number | { min?: number; max?: number },
  message: TMessage = `Data URI is the incorrect size` as TMessage
): CheckAction<string, TMessage> =>
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
