import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyCurrentUserNick,
  modifyCurrentUserNickSchema
} from "../modifyCurrentUserNick.js";

describe(`modifyCurrentUserNick`, { repeats: 5 }, () => {
  const responseSchema = v.object({
    nick: v.nullable(v.string())
  });
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/members/@me/nick`,
    modifyCurrentUserNickSchema,
    responseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyCurrentUserNick,
        modifyCurrentUserNickSchema,
        responseSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
