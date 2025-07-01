import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import type { User } from "../user/types/User.js";
import { userSchema } from "../user/types/User.js";

export const getAnswerVotersSchema = v.object({
  channel: snowflake,
  message: snowflake,
  answer: v.pipe(v.number(), v.integer(), v.minValue(0)),
  params: v.exactOptional(
    v.partial(
      v.object({
        /** Get users after this user ID */
        after: snowflake,
        /** Max number of users to return (1-100) */
        limit: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100))
      })
    )
  )
});

/**
 * ### [Get Answer Voters](https://discord.com/developers/docs/resources/poll#get-answer-voters)
 *
 * **GET** `/channels/:channel/polls/:message/answers/:answer`
 *
 * Get a list of users that voted for this specific answer.
 */
export const getAnswerVoters: Fetcher<
  typeof getAnswerVotersSchema,
  { users: User[] }
> = async ({ channel, message, answer, params }) =>
  get(`/channels/${channel}/polls/${message}/answers/${answer}`, params);

export const getAnswerVotersSafe = toValidated(
  getAnswerVoters,
  getAnswerVotersSchema,
  v.object({
    users: v.array(userSchema)
  })
);

export const getAnswerVotersProcedure = toProcedure(
  `query`,
  getAnswerVoters,
  getAnswerVotersSchema,
  v.object({
    users: v.array(userSchema)
  })
);

export const getAnswerVotersQuery = toQuery(getAnswerVoters);
