import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventSchema
} from "../modifyGuildScheduledEvent.js";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";

describe(`modifyGuildScheduledEvent`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/scheduled-events/:event`,
    modifyGuildScheduledEventSchema,
    scheduledEventSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildScheduledEvent,
        modifyGuildScheduledEventSchema,
        scheduledEventSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
