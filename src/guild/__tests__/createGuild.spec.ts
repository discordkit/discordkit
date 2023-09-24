import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuild,
  createGuildProcedure,
  createGuildSchema
} from "../createGuild";
import { guildSchema } from "../types/Guild";

describe(`createGuild`, () => {
  const expected = mockRequest.post(`/guilds`, guildSchema);
  const config = generateMock(createGuildSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
