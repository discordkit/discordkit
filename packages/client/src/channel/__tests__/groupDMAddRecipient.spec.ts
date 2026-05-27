import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  groupDMAddRecipient,
  groupDMAddRecipientSchema
} from "../groupDMAddRecipient.js";

describe(`groupDMAddRecipient`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/recipients/:user`,
    groupDMAddRecipientSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(groupDMAddRecipient, groupDMAddRecipientSchema)(config)
    ).resolves.not.toThrow();
  });
});
