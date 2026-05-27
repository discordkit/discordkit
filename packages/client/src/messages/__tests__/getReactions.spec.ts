import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { userSchema } from "../../user/types/User.js";
import { getReactionsSchema, getReactions } from "../getReactions.js";

describe(`getReactions`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    getReactionsSchema,
    v.pipe(v.array(userSchema), v.length(1)),
    { seed: 1 }
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getReactions,
        getReactionsSchema,
        v.pipe(v.array(userSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
