import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  activeGuildThreadsSchema,
  listActiveGuildThreadsSchema,
  listActiveGuildThreads
} from "../listActiveGuildThreads.js";

describe(`listActiveGuildThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/threads/active`,
    listActiveGuildThreadsSchema,
    activeGuildThreadsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listActiveGuildThreads,
        listActiveGuildThreadsSchema,
        activeGuildThreadsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
