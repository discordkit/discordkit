import * as v from "valibot";
import { bitfield } from "@discordkit/core/validations/bitfield";

export const RoleFlags = {
  /** role can be selected by members in an onboarding prompt */
  IN_PROMPT: 1 << 0
} as const;

/**
 * ### [Role Flags](https://discord.com/developers/docs/topics/permissions#role-object-role-flags)
 */
export const roleFlagsSchema = v.enum_(RoleFlags);
export const roleFlag = bitfield(`roleFlag`, RoleFlags, `Invalid Role Flag`);
