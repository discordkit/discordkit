import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildMFALevel,
  modifyGuildMFALevelProcedure,
  modifyGuildMFALevelSafe,
  modifyGuildMFALevelSchema
} from "../modifyGuildMFALevel";
import { mfaLevelSchema } from "../types/MFALevel";

describe(`modifyGuildMFALevel`, () => {
  const expected = mockRequest.patch(`/guilds/:guild/mfa`, mfaLevelSchema);
  const config = generateMock(modifyGuildMFALevelSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildMFALevelSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildMFALevelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildMFALevel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
