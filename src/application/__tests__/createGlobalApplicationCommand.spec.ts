import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGlobalApplicationCommandProcedure,
  createGlobalApplicationCommand,
  createGlobalApplicationCommandSchema
} from "../createGlobalApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`createGlobalApplicationCommand`, () => {
  const expected = mockRequest.post(
    `/applications/:application/commands`,
    applicationCommandSchema
  );
  const input = generateMock(createGlobalApplicationCommandSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGlobalApplicationCommandProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGlobalApplicationCommand);
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
