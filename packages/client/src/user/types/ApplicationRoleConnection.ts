import * as v from "valibot";
import { boundedString } from "@discordkit/core";

export const applicationRoleConnectionSchema = v.object({
  /** the vanity name of the platform a bot has connected (max 50 characters) */
  platformName: v.nullable(v.string()),
  /** the username on the platform a bot has connected (max 100 characters) */
  platformUsername: v.nullable(v.string()),
  /** object mapping application role connection metadata keys to their string-ified value (max 100 characters) for the user on the platform a bot has connected */
  metadata: v.record(
    v.pipe(boundedString({ max: 50 }), v.regex(/[a-z0-9_]/)),
    boundedString({ max: 100 })
  )
});

export interface ApplicationRoleConnection
  extends v.InferOutput<typeof applicationRoleConnectionSchema> {}
