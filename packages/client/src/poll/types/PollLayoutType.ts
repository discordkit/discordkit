import { enum_ } from "valibot";

/** We might have different layouts for polls in the future. For now though, this number will be 1. */
export const PollLayoutType = {
  /** The, uhm, default layout type. */
  DEFAULT: 1
} as const;

export const pollLayoutTypeSchema = enum_(PollLayoutType);
