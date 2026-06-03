import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventSchema
} from "../deleteGuildScheduledEvent.js";

describe(`deleteGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/scheduled-events/:event`,
    deleteGuildScheduledEventSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteGuildScheduledEvent,
        deleteGuildScheduledEventSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
