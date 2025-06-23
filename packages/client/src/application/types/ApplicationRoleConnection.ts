import {
  pipe,
  object,
  string,
  optional,
  record,
  minLength,
  maxLength,
  regex,
  type InferOutput
} from "valibot";

export const applicationRoleConnectionSchema = object({
  /** the vanity name of the platform a bot has connected (max 50 characters) */
  platformName: optional(string()),
  /** the username on the platform a bot has connected (max 100 characters) */
  platformUsername: optional(string()),
  /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
  metadata: record(
    pipe(string(), minLength(1), maxLength(50), regex(/[a-z0-9_]/)),
    pipe(string(), maxLength(100))
  )
});

export type ApplicationRoleConnection = InferOutput<
  typeof applicationRoleConnectionSchema
>;
