import { type Output, object, optional, string } from "valibot";

export const activitySecretsSchema = object({
  /** the secret for joining a party */
  join: optional(string()),
  /** the secret for spectating a game */
  spectate: optional(string()),
  /** the secret for a specific instanced match */
  match: optional(string())
});

export type ActivitySecrets = Output<typeof activitySecretsSchema>;
