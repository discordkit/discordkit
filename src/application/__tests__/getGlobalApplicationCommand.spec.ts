import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGlobalApplicationCommandSchema,
  getGlobalApplicationCommandProcedure,
  getGlobalApplicationCommandQuery
} from "../getGlobalApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`getGlobalApplicationCommand`, () => {
  const expected = mockRequest.get(
    `/applications/:application/commands/:command`,
    applicationCommandSchema
  );
  const input = generateMock(getGlobalApplicationCommandSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandQuery, input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
