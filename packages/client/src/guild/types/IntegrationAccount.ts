import * as v from "valibot";

export const integrationAccountSchema = v.object({
  /** id of the account */
  id: v.string(),
  /** name of the account */
  name: v.string()
});

export interface IntegrationAccount
  extends v.InferOutput<typeof integrationAccountSchema> {}
