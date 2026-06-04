import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  bulkDeleteMessages,
  bulkDeleteMessagesSchema
} from "../bulkDeleteMessages.js";

describe(`bulkDeleteMessages`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/messages/bulk-delete`,
    bulkDeleteMessagesSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(bulkDeleteMessages, bulkDeleteMessagesSchema)(config)
    ).resolves.not.toThrow();
  });
});
