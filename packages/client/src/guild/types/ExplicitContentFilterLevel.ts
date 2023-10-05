import { z } from "zod";

export enum ExplicitContentFilterLevel {
  /** media content will not be scanned */
  DISABLED = 0,
  /** media content sent by members without roles will be scanned */
  MEMBERS_WITHOUT_ROLES = 1,
  /** media content sent by all members will be scanned */
  ALL_MEMBERS = 2
}

export const explicitContentFilterLevelSchema = z.nativeEnum(
  ExplicitContentFilterLevel
);
