import type { Scopes } from "./Scopes";

// https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure

export interface InstallParams {
  /** the scopes to add the application to the server with */
  scopes: Scopes[];
  /** the permissions to request for the bot role */
  permissions: string;
}
