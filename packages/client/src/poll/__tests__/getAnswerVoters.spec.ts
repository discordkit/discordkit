import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { getAnswerVotersSchema, getAnswerVoters } from "../getAnswerVoters.js";
import { userSchema } from "../../user/types/User.js";

describe(`getAnswerVoters`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/polls/:message/answers/:answer`,
    getAnswerVotersSchema,
    v.object({
      users: v.array(userSchema)
    })
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getAnswerVoters,
        getAnswerVotersSchema,
        v.object({
          users: v.array(userSchema)
        })
      )(config)
    ).resolves.toEqual(expected);
  });
});
