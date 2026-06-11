import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { scheduledEventSchema } from "../types/ScheduledEvent.js";
import {
  listScheduledEventsForGuildSchema,
  listScheduledEventsForGuild
} from "../listScheduledEventsForGuild.js";

describe(`listScheduledEventsForGuild`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/scheduled-events`,
    listScheduledEventsForGuildSchema,
    v.pipe(v.array(scheduledEventSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listScheduledEventsForGuild,
        listScheduledEventsForGuildSchema,
        v.pipe(v.array(scheduledEventSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
