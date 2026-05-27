import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { banSchema } from "../types/Ban.js";
import { getGuildBansSchema, getGuildBans } from "../getGuildBans.js";

describe(`getGuildBans`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/bans`,
    getGuildBansSchema,
    v.pipe(v.array(banSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildBans,
        getGuildBansSchema,
        v.pipe(v.array(banSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
