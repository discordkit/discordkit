import * as v from "valibot";
import { bitfield } from "@discordkit/core";

export const RoleFlags = {
  /** role can be selected by members in an onboarding prompt */
  IN_PROMPT: 1 << 0
} as const;

export const roleFlagsSchema = v.enum_(RoleFlags);
export const roleFlag = bitfield(`roleFlag`, RoleFlags, `Invalid Role Flag`);
