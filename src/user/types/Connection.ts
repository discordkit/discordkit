import type { Integration } from "../../guild";
import type { ConnectionVisibilty } from "./ConnectionVisibilty";

export interface Connection {
  /** id of the connection account */
  id: string;
  /** the username of the connection account */
  name: string;
  /** the service of the connection (twitch, youtube) */
  type: string;
  /** whether the connection is revoked */
  revoked?: boolean;
  /** an array of partial server integrations */
  integrations?: Integration[];
  /** whether the connection is verified */
  verified: boolean;
  /** whether friend sync is enabled for this connection */
  friendSync: boolean;
  /** whether activities related to this connection will be shown in presence updates */
  showActivity: boolean;
  /** visibility of this connection */
  visibility: ConnectionVisibilty;
}
