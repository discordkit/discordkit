import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  listPrivateArchivedThreadsSchema,
  listPrivateArchivedThreads
} from "../listPrivateArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listPrivateArchivedThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/threads/archived/private`,
    listPrivateArchivedThreadsSchema,
    archivedThreadsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listPrivateArchivedThreads,
        listPrivateArchivedThreadsSchema,
        archivedThreadsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
