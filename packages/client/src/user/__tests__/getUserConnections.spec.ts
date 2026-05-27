import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getUserConnections } from "../getUserConnections.js";
import { connectionSchema } from "../types/Connection.js";

describe(`getUserConnections`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/users/@me/connections`,
    null,
    connectionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getUserConnections, null, connectionSchema)()
    ).resolves.toEqual(expected);
  });
});
