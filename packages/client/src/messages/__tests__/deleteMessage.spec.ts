import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { deleteMessage, deleteMessageSchema } from "../deleteMessage.js";

describe(`deleteMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message`,
    deleteMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteMessage, deleteMessageSchema)(config)
    ).resolves.not.toThrow();
  });
});
