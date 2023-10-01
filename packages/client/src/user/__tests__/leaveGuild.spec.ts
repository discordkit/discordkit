import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  leaveGuild,
  leaveGuildProcedure,
  leaveGuildSafe,
  leaveGuildSchema
} from "../leaveGuild.ts";

describe(`leaveGuild`, () => {
  mockRequest.delete(`/users/@me/guilds/:guild`);
  const config = mockSchema(leaveGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(leaveGuildSafe(config)).resolves.not.toThrow();
  });

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
