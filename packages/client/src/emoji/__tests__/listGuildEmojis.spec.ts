import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { emojiSchema } from "../types/Emoji.js";
import { listGuildEmojisSchema, listGuildEmojis } from "../listGuildEmojis.js";

describe(`listGuildEmojis`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/emojis`,
    listGuildEmojisSchema,
    v.pipe(v.array(emojiSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listGuildEmojis,
        listGuildEmojisSchema,
        v.pipe(v.array(emojiSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
