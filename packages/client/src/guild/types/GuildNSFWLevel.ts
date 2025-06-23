import { enum_ } from "valibot";

export enum GuildNSFWLevel {
  DEFAULT = 0,
  EXPLICIT = 1,
  SAFE = 2,
  AGE_RESTRICTED = 3
}

export const guildNSFWLevelSchema = enum_(GuildNSFWLevel);
