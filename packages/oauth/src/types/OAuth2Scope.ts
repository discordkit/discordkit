/**
 * Known Discord OAuth2 scopes, as documented at
 * https://docs.discord.com/developers/topics/oauth2#shared-resources-oauth2-scopes
 *
 * The union is intentionally *open* — `(string & {})` keeps autocomplete on
 * the known values while still accepting any scope string Discord may add
 * (or any partner-gated scope) without requiring a package version bump.
 * Discord, not this package, is the source of truth for which scopes a given
 * application is allowed to request.
 */
export type OAuth2Scope =
  | `activities.read`
  | `activities.write`
  | `applications.builds.read`
  | `applications.builds.upload`
  | `applications.commands`
  | `applications.commands.update`
  | `applications.commands.permissions.update`
  | `applications.entitlements`
  | `applications.store.update`
  | `bot`
  | `connections`
  | `dm_channels.read`
  | `email`
  | `gdm.join`
  | `guilds`
  | `guilds.join`
  | `guilds.members.read`
  | `identify`
  | `messages.read`
  | `relationships.read`
  | `role_connections.write`
  | `rpc`
  | `rpc.activities.write`
  | `rpc.notifications.read`
  | `rpc.voice.read`
  | `rpc.voice.write`
  | `voice`
  | `webhook.incoming`
  // Open escape hatch: accept any string while preserving autocomplete above.
  // oxlint-disable-next-line typescript/no-empty-object-type
  | (string & {});
