import { z } from "zod";
import { scopes } from "./Scopes";

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure

export const installParams = z.object({
  /** the scopes to add the application to the server with */
  scopes: scopes.array(),
  /** the permissions to request for the bot role */
  permissions: z.string()
});

export type InstallParams = z.infer<typeof installParams>;
