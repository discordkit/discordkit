import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  triggerTypingIndicator,
  triggerTypingIndicatorSchema
} from "../triggerTypingIndicator.js";

describe(`triggerTypingIndicator`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/typing`,
    triggerTypingIndicatorSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(triggerTypingIndicator, triggerTypingIndicatorSchema)(config)
    ).resolves.not.toThrow();
  });
});
