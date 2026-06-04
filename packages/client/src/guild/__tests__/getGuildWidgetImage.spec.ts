import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildWidgetImageSchema,
  getGuildWidgetImage
} from "../getGuildWidgetImage.js";

describe(`getGuildWidgetImage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.get(
    `/guilds/:guild/widget.png`,
    getGuildWidgetImageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuildWidgetImage, getGuildWidgetImageSchema)(config)
    ).resolves.not.toThrow();
  });
});
