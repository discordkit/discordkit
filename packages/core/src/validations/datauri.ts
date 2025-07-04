import * as v from "valibot";

export const datauriRegex =
  /^data:((?<mediaType>(?<mimeType>[a-z]+\/[a-z0-9-+.]+)(?<params>;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*))?(?<encoding>;base64)?,(?<data>[a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i;

/**
 * Extracts metadata from a given Data URI such as it's
 * MIME type, params, and encoding
 *
 * Returns an empty object when given an invalid Data URI
 */
export const extractDataURIMetadata = (
  val: string
): Partial<{
  mediaType: string;
  mimeType: `${string}/${string}`;
  params: string;
  encoding: string;
  data: string;
}> => datauriRegex.exec(val)?.groups ?? {};

export const toBase64 = (data: string): string =>
  typeof Buffer !== `undefined`
    ? Buffer.from(data, `base64`).toString()
    : atob(
        btoa(String.fromCharCode(...new TextEncoder().encode(data)))
          .replace(/\+/g, `-`)
          .replace(/\//g, `_`)
          .replace(/=/g, ``)
      );

/**
 * Validates that a string is a [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme)
 */
export const datauri: v.GenericSchema<string> = v.pipe(
  v.custom<string>(
    (val) =>
      typeof val === `string` && val.length > 0 && datauriRegex.test(val),
    `Invalid Data URI`
  ),
  v.title(`datauri`)
);
