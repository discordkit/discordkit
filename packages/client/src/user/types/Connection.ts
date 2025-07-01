import * as v from "valibot";
import { integrationSchema } from "../../guild/types/Integration.js";
import { connectionVisibiltySchema } from "./ConnectionVisibilty.js";
import { servicesSchema } from "./Services.js";

export const connectionSchema = v.object({
  /** id of the connection account */
  id: v.pipe(v.string(), v.nonEmpty()),
  /** the username of the connection account */
  name: v.pipe(v.string(), v.nonEmpty()),
  /** the service of the connection (twitch, youtube) */
  type: servicesSchema,
  /** whether the connection is revoked */
  revoked: v.exactOptional(v.boolean()),
  /** an array of partial server integrations */
  integrations: v.exactOptional(v.array(integrationSchema)),
  /** whether the connection is verified */
  verified: v.boolean(),
  /** whether friend sync is enabled for this connection */
  friendSync: v.boolean(),
  /** whether activities related to this connection will be shown in presence updates */
  showActivity: v.boolean(),
  /** whether this connection has a corresponding third party OAuth2 token */
  twoWayLink: v.boolean(),
  /** visibility of this connection */
  visibility: connectionVisibiltySchema
});

export interface Connection extends v.InferOutput<typeof connectionSchema> {}
