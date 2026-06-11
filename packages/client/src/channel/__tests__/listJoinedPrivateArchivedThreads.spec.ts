import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  listJoinedPrivateArchivedThreadsSchema,
  listJoinedPrivateArchivedThreads
} from "../listJoinedPrivateArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listJoinedPrivateArchivedThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/users/@me/threads/archived/private`,
    listJoinedPrivateArchivedThreadsSchema,
    archivedThreadsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listJoinedPrivateArchivedThreads,
        listJoinedPrivateArchivedThreadsSchema,
        archivedThreadsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
