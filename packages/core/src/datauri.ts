import { custom, is, nonEmpty, pipe, regex, string, title } from "valibot";

export const datauriRegex =
  /^data:((?<media_type>(?<mime_type>[a-z]+\/[a-z0-9-+.]+)(?<params>;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*))?(?<encoding>;base64)?,(?<data>[a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i;

/**
 * Extracts metadata from a given Data URI such as it's
 * MIME type, params, and encoding
 *
 * Returns an empty object when given an invalid Data URI
 */
export const extractDataURIMetadata = (
  val: string
): Partial<{
  media_type: string;
  mime_type: `${string}/${string}`;
  params: string;
  encoding: string;
  data: string;
}> => datauriRegex.exec(val)?.groups ?? {};

/**
 * Validates that a string is a [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme)
 */
export const datauri = pipe(
  custom<string>(
    (val) => is(pipe(string(), nonEmpty(), regex(datauriRegex)), val),
    `Invalid Data URI`
  ),
  title(`datauri`)
);
