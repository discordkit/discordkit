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
  createGlobalApplicationCommandSchema,
  createGlobalApplicationCommandSafe
} from "../createGlobalApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`createGlobalApplicationCommand`, () => {
  const expected = mockRequest.post(
    `/applications/:application/commands`,
    applicationCommandSchema
  );
  const config = generateMock(createGlobalApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(
      createGlobalApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGlobalApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGlobalApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
