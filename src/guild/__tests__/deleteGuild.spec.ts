import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuild,
  deleteGuildProcedure,
  deleteGuildSchema
} from "../deleteGuild";

describe(`deleteGuild`, () => {
  mockRequest.delete(`/guilds/:guild`);
  const config = generateMock(deleteGuildSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
