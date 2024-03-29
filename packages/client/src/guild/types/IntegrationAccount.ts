import { z } from "zod";

export const integrationAccountSchema = z.object({
  /** id of the account */
  id: z.string(),
  /** name of the account */
  name: z.string()
});

export type IntegrationAccount = z.infer<typeof integrationAccountSchema>;
