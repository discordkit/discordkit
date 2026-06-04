import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  crosspostMessage,
  crosspostMessageSchema
} from "../crosspostMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`crosspostMessage`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/messages/:message/crosspost`,
    crosspostMessageSchema,
    messageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        crosspostMessage,
        crosspostMessageSchema,
        messageSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
