import { check, type CheckAction } from "valibot";
import { extractDataURIMetadata } from "./datauri.js";

/**
 * Validation action to check if the given `datauri` string
 * has one of the provided [MIME types](https://en.wikipedia.org/wiki/Media_type)
 *
 * @__NO_SIDE_EFFECTS__
 */
export const hasMimeType = <
  TMessage extends string = `Received badly formatted Data URI`
>(
  /** an array of MIME types to validate against */
  requirement: Array<`${string}/${string}`>,
  /** an optional error message on failed validation */
  message: TMessage = `Received badly formatted Data URI` as TMessage
): CheckAction<string, TMessage> =>
  check((input: string) => {
    const { mimeType } = extractDataURIMetadata(input);
    if (typeof mimeType === `undefined`) {
      return false;
    }
    return requirement.includes(mimeType);
  }, message);
