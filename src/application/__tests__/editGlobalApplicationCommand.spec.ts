import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editGlobalApplicationCommand,
  editGlobalApplicationCommandProcedure,
  editGlobalApplicationCommandSchema
} from "../editGlobalApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`editGlobalApplicationCommand`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/commands/:command`,
    applicationCommandSchema
  );
  const input = generateMock(editGlobalApplicationCommandSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editGlobalApplicationCommandProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editGlobalApplicationCommand);
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
