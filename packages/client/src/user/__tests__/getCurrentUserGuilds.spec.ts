import { toValidated } from "@discordkit/core/requests/toValidated";
import { partialSchema } from "@discordkit/core/validations/schema";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { guildSchema } from "../../guild/types/Guild.js";
import {
  getCurrentUserGuildsSchema,
  getCurrentUserGuilds
} from "../getCurrentUserGuilds.js";

describe(`getCurrentUserGuilds`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/guilds`,
    getCurrentUserGuildsSchema,
    v.pipe(v.array(partialSchema(guildSchema)), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getCurrentUserGuilds,
        getCurrentUserGuildsSchema,
        v.pipe(v.array(partialSchema(guildSchema)), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
