import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { getCurrentApplication } from "../getCurrentApplication.js";
import { applicationSchema } from "../types/Application.js";

describe(`getCurrentApplication`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/applications/@me`,
    null,
    applicationSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getCurrentApplication, null, applicationSchema)()
    ).resolves.toEqual(expected);
  });
});
