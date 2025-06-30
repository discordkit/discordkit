import {
  array,
  boolean,
  maxValue,
  minValue,
  number,
  object,
  exactOptional,
  partial,
  pipe
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  scheduledEventUserSchema,
  type ScheduledEventUser
} from "./types/ScheduledEventUser.js";

export const getGuildScheduledEventUsersSchema = object({
  guild: snowflake,
  event: snowflake,
  params: exactOptional(
    partial(
      object({
        /** number of users to return (up to maximum 100) (default: 100) */
        limit: pipe(number(), minValue(1), maxValue(100)),
        /** include guild member data if it exists (default: false) */
        withMember: boolean(),
        /** consider only users before given user id (default: null) */
        before: snowflake,
        /** consider only users after given user id (default: null) */
        after: snowflake
      })
    )
  )
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
  array(scheduledEventUserSchema)
);

export const getGuildScheduledEventUsersProcedure = toProcedure(
  `query`,
  getGuildScheduledEventUsers,
  getGuildScheduledEventUsersSchema,
  array(scheduledEventUserSchema)
);

export const getGuildScheduledEventUsersQuery = toQuery(
  getGuildScheduledEventUsers
);
