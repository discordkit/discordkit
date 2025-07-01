import * as v from "valibot";

export const applicationRoleConnectionSchema = v.object({
  /** the vanity name of the platform a bot has connected (max 50 characters) */
  platformName: v.nullable(v.string()),
  /** the username on the platform a bot has connected (max 100 characters) */
  platformUsername: v.nullable(v.string()),
  /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
  metadata: v.record(
    v.pipe(v.string(), v.minLength(1), v.maxLength(50), v.regex(/[a-z0-9_]/)),
    v.pipe(v.string(), v.maxLength(100))
  )
});

export interface ApplicationRoleConnection
  extends v.InferOutput<typeof applicationRoleConnectionSchema> {}
