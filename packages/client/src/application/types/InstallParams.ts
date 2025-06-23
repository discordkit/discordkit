import { type InferOutput, object, array, string } from "valibot";
import { scopesSchema } from "./Scopes.js";

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure

export const installParamsSchema = object({
  /** the scopes to add the application to the server with */
  scopes: array(scopesSchema),
  /** the permissions to request for the bot role */
  permissions: string()
});

export type InstallParams = InferOutput<typeof installParamsSchema>;
