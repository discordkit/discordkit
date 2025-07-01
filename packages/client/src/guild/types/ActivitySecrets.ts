import * as v from "valibot";

export const activitySecretsSchema = v.object({
  /** the secret for joining a party */
  join: v.optional(v.string()),
  /** the secret for spectating a game */
  spectate: v.optional(v.string()),
  /** the secret for a specific instanced match */
  match: v.optional(v.string())
});

export interface ActivitySecrets
  extends v.InferOutput<typeof activitySecretsSchema> {}
