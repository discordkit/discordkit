import * as v from "valibot";
import { bitfield } from "@discordkit/core";

export const ActivityFlags = {
  INSTANCE: 1 << 0,
  JOIN: 1 << 1,
  SPECTATE: 1 << 2,
  JOIN_REQUEST: 1 << 3,
  SYNC: 1 << 4,
  PLAY: 1 << 5,
  PARTY_PRIVACY_FRIENDS: 1 << 6,
  PARTY_PRIVACY_VOICE_CHANNEL: 1 << 7,
  EMBEDDED: 1 << 8
} as const;

export const activityFlagsSchema = v.enum_(ActivityFlags);
export const activityFlag = bitfield(
  `activityFlag`,
  ActivityFlags,
  `Invalid Activity Flag`
);
