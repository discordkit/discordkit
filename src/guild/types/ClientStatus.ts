/** Active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present. */

import { z } from "zod";

export const clientStatus = z.object({
  /** the user's status set for an active desktop (Windows, Linux, Mac) application session */
  desktop: z.string().optional(),
  /** the user's status set for an active mobile (iOS, Android) application session */
  mobile: z.string().optional(),
  /** the user's status set for an active web (browser, bot account) application session */
  web: z.string().optional()
});

export type ClientStatus = z.infer<typeof clientStatus>;
