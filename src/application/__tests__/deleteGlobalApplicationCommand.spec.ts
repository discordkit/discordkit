import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGlobalApplicationCommand,
  deleteGlobalApplicationCommandProcedure,
  deleteGlobalApplicationCommandSchema
} from "../deleteGlobalApplicationCommand";

describe(`deleteGlobalApplicationCommand`, () => {
  mockRequest.delete(`/applications/:application/commands/:command`);
  const config = generateMock(deleteGlobalApplicationCommandSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGlobalApplicationCommandProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGlobalApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
