import { type Output, object, string, boolean, nullish, array } from "valibot";
import { integrationSchema } from "../../guild/types/Integration.js";
import { connectionVisibiltySchema } from "./ConnectionVisibilty.js";
import { servicesSchema } from "./Services.js";

export const connectionSchema = object({
  /** id of the connection account */
  id: string(),
  /** the username of the connection account */
  name: string(),
  /** the service of the connection (twitch, youtube) */
  type: servicesSchema,
  /** whether the connection is revoked */
  revoked: nullish(boolean()),
  /** an array of partial server integrations */
  integrations: nullish(array(integrationSchema)),
  /** whether the connection is verified */
  verified: boolean(),
  /** whether friend sync is enabled for this connection */
  friendSync: boolean(),
  /** whether activities related to this connection will be shown in presence updates */
  showActivity: boolean(),
  /** whether this connection has a corresponding third party OAuth2 token */
  twoWayLink: boolean(),
  /** visibility of this connection */
  visibility: connectionVisibiltySchema
});

export type Connection = Output<typeof connectionSchema>;
