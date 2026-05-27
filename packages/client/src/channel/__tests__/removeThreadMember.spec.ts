import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  removeThreadMember,
  removeThreadMemberSchema
} from "../removeThreadMember.js";

describe(`removeThreadMember`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/thread-members/:user`,
    removeThreadMemberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(removeThreadMember, removeThreadMemberSchema)(config)
    ).resolves.not.toThrow();
  });
});
