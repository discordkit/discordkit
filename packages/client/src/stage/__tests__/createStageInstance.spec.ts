import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  createStageInstance,
  createStageInstanceSchema
} from "../createStageInstance.js";
import { stageSchema } from "../types/Stage.js";

describe(`createStageInstance`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/stage-instances`,
    createStageInstanceSchema,
    stageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createStageInstance,
        createStageInstanceSchema,
        stageSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
