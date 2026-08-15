import type { GuildApplicationCommandPermissions } from "@discordkit/client/application-commands/types/GuildApplicationCommandPermissions";
import { dispatchEvent } from "./dispatch.js";

/**
 * ### [Application Command Permissions Update](https://discord.com/developers/docs/events/gateway-events#application-command-permissions-update)
 *
 * `APPLICATION_COMMAND_PERMISSIONS_UPDATE` event, sent when an application
 * command's permissions are updated. The inner payload is an application
 * command permissions object.
 *
 * Never gated by an intent — Discord always sends it.
 */
export const onApplicationCommandPermissionsUpdate = dispatchEvent<
  GuildApplicationCommandPermissions,
  `APPLICATION_COMMAND_PERMISSIONS_UPDATE`
>(`APPLICATION_COMMAND_PERMISSIONS_UPDATE`);
