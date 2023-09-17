import { z } from "zod";

export enum InviteTarget {
  STREAM = 1,
  EMBEDDED_APPLICATION = 2
}

export const inviteTarget = z.nativeEnum(InviteTarget);
