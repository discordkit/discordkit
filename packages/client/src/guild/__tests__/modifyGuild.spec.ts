import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  modifyGuild,
  modifyGuildProcedure,
  modifyGuildSafe,
  modifyGuildSchema
} from "../modifyGuild.js";
import { guildSchema } from "../types/Guild.js";

describe(`modifyGuild`, () => {
  const expected = mockRequest.patch(`/guilds/:guild`, guildSchema);
  const config = mockSchema(modifyGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(modifyGuildProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
