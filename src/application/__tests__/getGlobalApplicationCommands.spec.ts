import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGlobalApplicationCommandsSchema,
  getGlobalApplicationCommandsProcedure,
  getGlobalApplicationCommandsQuery
} from "../getGlobalApplicationCommands";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`getGlobalApplicationCommands`, () => {
  const expected = mockRequest.get(
    `/applications/:application/commands`,
    applicationCommandSchema.array()
  );
  const input = generateMock(getGlobalApplicationCommandsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandsProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandsQuery, input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
