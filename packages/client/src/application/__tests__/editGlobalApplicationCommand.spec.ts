import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  editGlobalApplicationCommand,
  editGlobalApplicationCommandProcedure,
  editGlobalApplicationCommandSafe,
  editGlobalApplicationCommandSchema
} from "../editGlobalApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`editGlobalApplicationCommand`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/commands/:command`,
    applicationCommandSchema
  );
  const config = mockSchema(editGlobalApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(editGlobalApplicationCommandSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editGlobalApplicationCommandProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editGlobalApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
