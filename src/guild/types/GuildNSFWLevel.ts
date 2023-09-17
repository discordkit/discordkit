import { z } from "zod";

export enum GuildNSFWLevel {
  DEFAULT = 0,
  EXPLICIT = 1,
  SAFE = 2,
  AGE_RESTRICTED = 3
}

export const guildNSFWLevel = z.nativeEnum(GuildNSFWLevel);
