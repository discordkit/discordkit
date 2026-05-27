import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { scheduledEventUserSchema } from "../types/ScheduledEventUser.js";
import {
  getGuildScheduledEventUsersSchema,
  getGuildScheduledEventUsers
} from "../getGuildScheduledEventUsers.js";

describe(`getGuildScheduledEventUsers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/scheduled-events/:event/users`,
    getGuildScheduledEventUsersSchema,
    v.pipe(v.array(scheduledEventUserSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getGuildScheduledEventUsers,
        getGuildScheduledEventUsersSchema,
        v.pipe(v.array(scheduledEventUserSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
