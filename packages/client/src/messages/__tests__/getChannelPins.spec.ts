import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { messagePinSchema } from "../types/MessagePin.js";
import { getChannelPinsSchema, getChannelPins } from "../getChannelPins.js";

describe(`getChannelPins`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages/pins`,
    getChannelPinsSchema,
    v.pipe(v.array(messagePinSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelPins,
        getChannelPinsSchema,
        v.pipe(v.array(messagePinSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
