import { z } from "zod";
import { integrationSchema } from "../../guild/types/Integration";
import { connectionVisibiltySchema } from "./ConnectionVisibilty";
import { servicesSchema } from "./Services";

export const connectionSchema = z.object({
  /** id of the connection account */
  id: z.string(),
  /** the username of the connection account */
  name: z.string(),
  /** the service of the connection (twitch, youtube) */
  type: servicesSchema,
  /** whether the connection is revoked */
  revoked: z.boolean().nullable(),
  /** an array of partial server integrations */
  integrations: integrationSchema.array().nullable(),
  /** whether the connection is verified */
  verified: z.boolean(),
  /** whether friend sync is enabled for this connection */
  friendSync: z.boolean(),
  /** whether activities related to this connection will be shown in presence updates */
  showActivity: z.boolean(),
  /** whether this connection has a corresponding third party OAuth2 token */
  twoWayLink: z.boolean(),
  /** visibility of this connection */
  visibility: connectionVisibiltySchema
});

export type Connection = z.infer<typeof connectionSchema>;
