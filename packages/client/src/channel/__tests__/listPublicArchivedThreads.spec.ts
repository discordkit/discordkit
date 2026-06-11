import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  listPublicArchivedThreadsSchema,
  listPublicArchivedThreads
} from "../listPublicArchivedThreads.js";
import { archivedThreadsSchema } from "../types/ArchivedThreads.js";

describe(`listPublicArchivedThreads`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/threads/archived/public`,
    listPublicArchivedThreadsSchema,
    archivedThreadsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listPublicArchivedThreads,
        listPublicArchivedThreadsSchema,
        archivedThreadsSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
