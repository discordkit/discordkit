/** Active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present. */

import { object, optional, string, type Output } from "valibot";

export const clientStatusSchema = object({
  /** the user's status set for an active desktop (Windows, Linux, Mac) application session */
  desktop: optional(string()),
  /** the user's status set for an active mobile (iOS, Android) application session */
  mobile: optional(string()),
  /** the user's status set for an active web (browser, bot account) application session */
  web: optional(string())
});

export type ClientStatus = Output<typeof clientStatusSchema>;
