import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { addThreadMember, addThreadMemberSchema } from "../addThreadMember.js";

describe(`addThreadMember`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/thread-members/:user`,
    addThreadMemberSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(addThreadMember, addThreadMemberSchema)(config)
    ).resolves.not.toThrow();
  });
});
