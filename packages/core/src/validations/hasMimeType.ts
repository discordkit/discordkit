import { check, type CheckAction } from "valibot";
import { extractDataURIMetadata } from "./datauri.js";

/**
 * Validation action to check if the given `datauri` string
 * has one of the provided [MIME types](https://en.wikipedia.org/wiki/Media_type)
 */
export const hasMimeType = (
  /** an array of MIME types to validate against */
  requirement: Array<`${string}/${string}`>,
  /** an optional error message on failed validation */
  message = `Received badly formatted Data URI` as const
): CheckAction<string, typeof message> =>
  check((input: string) => {
    const { mimeType } = extractDataURIMetadata(input);
    if (typeof mimeType === `undefined`) {
      return false;
    }
    return requirement.includes(mimeType);
  }, message);
