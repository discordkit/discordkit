import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { scheduledEventUserSchema, type ScheduledEventUser } from "./types";

export const getGuildScheduledEventUsersSchema = z.object({
  guild: z.string().min(1),
  event: z.string().min(1),
  params: z
    .object({
      /** number of users to return (up to maximum 100) (default: 100) */
      limit: z.number().min(1).max(100),
      /** include guild member data if it exists (default: false) */
      withMember: z.boolean(),
      /** consider only users before given user id (default: undefined) */
      before: z.string().min(1),
      /** consider only users after given user id (default: undefined) */
      after: z.string().min(1)
    })
    .partial()
    .optional()
});

/**
 * Get a list of guild scheduled event users subscribed to a guild scheduled event. Returns a list of guild scheduled event user objects on success. Guild member data, if it exists, is included if the `with_member` query parameter is set.
 *
 * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users
 */
export const getGuildScheduledEventUsers: Fetcher<
  typeof getGuildScheduledEventUsersSchema,
  ScheduledEventUser[]
> = async ({ guild, event, params }) =>
  get(`/guilds/${guild}/scheduled-events/${event}/users`, params);

export const getGuildScheduledEventUsersProcedure = createProcedure(
  `query`,
  getGuildScheduledEventUsers,
  getGuildScheduledEventUsersSchema,
  scheduledEventUserSchema.array()
);
