import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { pinMessage, pinMessageSchema } from "../pinMessage.js";

describe(`pinMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/messages/pins/:message`,
    pinMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(pinMessage, pinMessageSchema)(config)
    ).resolves.not.toThrow();
  });
});
