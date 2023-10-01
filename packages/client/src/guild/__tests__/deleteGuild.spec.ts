import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteGuild,
  deleteGuildProcedure,
  deleteGuildSafe,
  deleteGuildSchema
} from "../deleteGuild.ts";

describe(`deleteGuild`, () => {
  mockRequest.delete(`/guilds/:guild`);
  const config = generateMock(deleteGuildSchema);

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