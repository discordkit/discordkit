import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteGuild,
  deleteGuildProcedure,
  deleteGuildSafe,
  deleteGuildSchema
} from "../deleteGuild.ts";

describe(`deleteGuild`, () => {
  mockRequest.delete(`/guilds/:guild`);
  const config = mockSchema(deleteGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteGuildSafe(config)).resolves.not.toThrow();
  });

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
