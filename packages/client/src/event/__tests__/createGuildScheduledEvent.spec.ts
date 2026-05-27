import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  createGuildScheduledEvent,
  createGuildScheduledEventSchema
} from "../createGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`createGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/scheduled-events`,
    createGuildScheduledEventSchema,
    scheduledEventSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildScheduledEvent,
        createGuildScheduledEventSchema,
        scheduledEventSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
