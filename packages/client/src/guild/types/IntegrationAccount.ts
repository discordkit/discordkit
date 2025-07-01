import { type InferOutput, object, string } from "valibot";

export const integrationAccountSchema = object({
  /** id of the account */
  id: string(),
  /** name of the account */
  name: string()
});

export interface IntegrationAccount
  extends InferOutput<typeof integrationAccountSchema> {}
