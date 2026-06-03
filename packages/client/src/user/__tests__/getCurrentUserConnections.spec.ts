import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getCurrentUserConnections } from "../getCurrentUserConnections.js";
import { connectionSchema } from "../types/Connection.js";

describe(`getCurrentUserConnections`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/users/@me/connections`,
    null,
    v.array(connectionSchema)
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getCurrentUserConnections, null, v.array(connectionSchema))()
    ).resolves.toEqual(expected);
  });
});
