import * as v from "valibot";
import { asDigits } from "@discordkit/core";
import { scopesSchema } from "./Scopes.js";
import { permissionFlag } from "../../permissions/Permissions.js";

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure

export const installParamsSchema = v.object({
  /** Scopes to add the application to the server with */
  scopes: v.array(scopesSchema),
  /** 	Permissions to request for the bot role */
  permissions: asDigits(permissionFlag) as v.GenericSchema<string>
});

export interface InstallParams
  extends v.InferOutput<typeof installParamsSchema> {}
