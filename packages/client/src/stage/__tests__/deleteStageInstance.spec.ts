import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import {
  deleteStageInstance,
  deleteStageInstanceSchema
} from "../deleteStageInstance.js";

describe(`deleteStageInstance`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/stage-instances/:channel`,
    deleteStageInstanceSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteStageInstance, deleteStageInstanceSchema)(config)
    ).resolves.not.toThrow();
  });
});
