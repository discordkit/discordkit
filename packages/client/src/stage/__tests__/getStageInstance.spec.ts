import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getStageInstanceSchema,
  getStageInstance
} from "../getStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`getStageInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/stage-instances/:channel`,
    getStageInstanceSchema,
    stageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getStageInstance, getStageInstanceSchema, stageSchema)(config)
    ).resolves.toEqual(expected);
  });
});
