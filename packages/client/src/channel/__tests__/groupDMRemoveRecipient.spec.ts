import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  groupDMRemoveRecipient,
  groupDMRemoveRecipientSchema
} from "../groupDMRemoveRecipient.js";

describe(`groupDMRemoveRecipient`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/recipients/:user`,
    groupDMRemoveRecipientSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(groupDMRemoveRecipient, groupDMRemoveRecipientSchema)(config)
    ).resolves.not.toThrow();
  });
});
