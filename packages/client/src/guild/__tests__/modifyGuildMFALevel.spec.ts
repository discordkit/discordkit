import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildMFALevel,
  modifyGuildMFALevelProcedure,
  modifyGuildMFALevelSafe,
  modifyGuildMFALevelSchema
} from "../modifyGuildMFALevel.js";
import { mfaLevelSchema } from "../types/MFALevel.js";

describe(`modifyGuildMFALevel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/mfa`,
    modifyGuildMFALevelSchema,
    mfaLevelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildMFALevelSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildMFALevelProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildMFALevel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
