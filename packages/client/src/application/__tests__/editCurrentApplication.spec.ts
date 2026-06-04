import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  editCurrentApplication,
  editCurrentApplicationSchema
} from "../editCurrentApplication.js";
import { applicationSchema } from "../types/Application.js";

describe(`editCurrentApplication`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/@me`,
    editCurrentApplicationSchema,
    applicationSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        editCurrentApplication,
        editCurrentApplicationSchema,
        applicationSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
