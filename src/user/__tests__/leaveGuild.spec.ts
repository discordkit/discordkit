import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  leaveGuild,
  leaveGuildProcedure,
  leaveGuildSchema
} from "../leaveGuild";

describe(`leaveGuild`, () => {
  mockRequest.delete(`/users/@me/guilds/:guild`);
  const config = generateMock(leaveGuildSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(leaveGuildProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(leaveGuild);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
