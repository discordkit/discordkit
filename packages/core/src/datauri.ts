import { custom, is, nonEmpty, pipe, regex, string, title } from "valibot";

export const datauriRegex =
  /^data:((?<media_type>(?<mime_type>[a-z]+\/[a-z0-9-+.]+)(?<params>;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*))?(?<encoding>;base64)?,(?<data>[a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i;

export const extractDataURIMetadata = (
  val: string
): Partial<{
  media_type: string;
  mime_type: string;
  params: string;
  encoding: string;
  data: string;
}> => datauriRegex.exec(val)?.groups ?? {};

export const datauri = pipe(
  custom<string>(
    (val) => is(pipe(string(), nonEmpty(), regex(datauriRegex)), val),
    `Invalid Data URI`
  ),
  title(`datauri`)
);
