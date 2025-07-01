import { type InferOutput, object, array, type GenericSchema } from "valibot";
import { asDigits } from "@discordkit/core";
import { scopesSchema } from "./Scopes.js";
import { permissionFlag } from "../../permissions/Permissions.js";

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure

export const installParamsSchema = object({
  /** Scopes to add the application to the server with */
  scopes: array(scopesSchema),
  /** 	Permissions to request for the bot role */
  permissions: asDigits(permissionFlag) as GenericSchema<string>
});

export interface InstallParams
  extends InferOutput<typeof installParamsSchema> {}
