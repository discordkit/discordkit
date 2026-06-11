import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { unpinMessage, unpinMessageSchema } from "../unpinMessage.js";

describe(`unpinMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/pins/:message`,
    unpinMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(unpinMessage, unpinMessageSchema)(config)
    ).resolves.not.toThrow();
  });
});
