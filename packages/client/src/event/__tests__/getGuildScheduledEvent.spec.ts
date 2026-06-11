import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getGuildScheduledEventSchema,
  getGuildScheduledEvent
} from "../getGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`getGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/scheduled-events/:event`,
    getGuildScheduledEventSchema,
    scheduledEventSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildScheduledEvent,
        getGuildScheduledEventSchema,
        scheduledEventSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
