import type { User } from "../../user";
import type { ClientStatus } from "./ClientStatus";
import type { Activity } from "./Activity";

export interface Presence {
  /** the user presence is being updated for */
  user: User;
  /** id of the guild */
  guildId: string;
  /** either "idle", "dnd", "online", or "offline" */
  status: "idle" | "dnd" | "online" | "offline";
  /** user's current activities */
  activities: Activity[];
  /** user's platform-dependent status */
  clientStatus: ClientStatus;
}
