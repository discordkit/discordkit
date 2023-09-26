import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuildApplicationCommand,
  deleteGuildApplicationCommandProcedure,
  deleteGuildApplicationCommandSchema
} from "../deleteGuildApplicationCommand";

describe(`deleteGuildApplicationCommand`, () => {
  mockRequest.delete(
    `/applications/:application/guilds/:guild/commands/:command`
  );
  const config = generateMock(deleteGuildApplicationCommandSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildApplicationCommandProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
