import * as v from "valibot";
import { boundedString, schema } from "@discordkit/core";
import { integrationSchema } from "../../guild/types/Integration.js";
import { connectionVisibilitySchema } from "./ConnectionVisibility.js";
import { servicesSchema } from "./Services.js";

const _connectionSchema = v.object({
  /** id of the connection account */
  id: boundedString(),
  /** the username of the connection account */
  name: boundedString(),
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
  visibility: connectionVisibilitySchema
});

export interface Connection extends v.InferOutput<typeof _connectionSchema> {}

/**
 * ### [Connection](https://discord.com/developers/docs/resources/user#connection-object)
 *
 * The connection object that the user has attached.
 */
export const connectionSchema = schema<Connection>(_connectionSchema);
