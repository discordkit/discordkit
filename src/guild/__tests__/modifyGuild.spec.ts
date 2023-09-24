import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuild,
  modifyGuildProcedure,
  modifyGuildSchema
} from "../modifyGuild";
import { guildSchema } from "../types/Guild";

describe(`modifyGuild`, () => {
  const expected = mockRequest.patch(`/guilds/:guild`, guildSchema);
  const config = generateMock(modifyGuildSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
