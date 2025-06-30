import {
  array,
  exactOptional,
  integer,
  maxValue,
  minValue,
  number,
  object,
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
import type { User } from "../user/types/User.js";
import { userSchema } from "../user/types/User.js";

export const getAnswerVotersSchema = object({
  channel: snowflake,
  message: snowflake,
  answer: pipe(number(), integer(), minValue(0)),
  params: exactOptional(
    partial(
      object({
        /** Get users after this user ID */
        after: snowflake,
        /** Max number of users to return (1-100) */
        limit: pipe(number(), integer(), minValue(1), maxValue(100))
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
  object({
    users: array(userSchema)
  })
);

export const getAnswerVotersProcedure = toProcedure(
  `query`,
  getAnswerVoters,
  getAnswerVotersSchema,
  object({
    users: array(userSchema)
  })
);

export const getAnswerVotersQuery = toQuery(getAnswerVoters);
