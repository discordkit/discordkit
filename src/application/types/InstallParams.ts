import { z } from "zod";
import { scopesSchema } from "./Scopes";

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure

export const installParamsSchema = z.object({
  /** the scopes to add the application to the server with */
  scopes: scopesSchema.array(),
  /** the permissions to request for the bot role */
  permissions: z.string()
});

export type InstallParams = z.infer<typeof installParamsSchema>;
