import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyStageInstance,
  modifyStageInstanceSchema
} from "../modifyStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`modifyStageInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/stage-instances/:channel`,
    modifyStageInstanceSchema,
    stageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyStageInstance,
        modifyStageInstanceSchema,
        stageSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
