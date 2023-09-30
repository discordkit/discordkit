import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import {
  scheduledEventUserSchema,
  type ScheduledEventUser
} from "./types/ScheduledEventUser.ts";

export const getGuildScheduledEventUsersSchema = z.object({
  guild: z.string().min(1),
  event: z.string().min(1),
  params: z
    .object({
      /** number of users to return (up to maximum 100) (default: 100) */
      limit: z.number().min(1).max(100).nullable().default(100),
      /** include guild member data if it exists (default: false) */
      withMember: z.boolean().nullable().default(false),
      /** consider only users before given user id (default: null) */
      before: z.string().min(1).nullable().default(null),
      /** consider only users after given user id (default: null) */
      after: z.string().min(1).nullable().default(null)
    })
    .partial()
    .optional()
});

/**
 * ### [Get Guild Scheduled Event Users](https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event-users)
 *
 * **GET** `/guilds/:guild/scheduled-events/:event/users`
 *
 * Get a list of guild scheduled event users subscribed to a guild scheduled event. Returns a list of {@link ScheduledEventUser | guild scheduled event user objects} on success. Guild member data, if it exists, is included if the `withMember` query parameter is set.
 */
export const getGuildScheduledEventUsers: Fetcher<
  typeof getGuildScheduledEventUsersSchema,
  ScheduledEventUser[]
> = async ({ guild, event, params }) =>
  get(`/guilds/${guild}/scheduled-events/${event}/users`, params);

export const getGuildScheduledEventUsersSafe = toValidated(
  getGuildScheduledEventUsers,
  getGuildScheduledEventUsersSchema,
  scheduledEventUserSchema.array()
);

export const getGuildScheduledEventUsersProcedure = toProcedure(
  `query`,
  getGuildScheduledEventUsers,
  getGuildScheduledEventUsersSchema,
  scheduledEventUserSchema.array()
);

export const getGuildScheduledEventUsersQuery = toQuery(
  getGuildScheduledEventUsers
);
