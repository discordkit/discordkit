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
  getGlobalApplicationCommandQuery,
  getGlobalApplicationCommandSafe
} from "../getGlobalApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`getGlobalApplicationCommand`, () => {
  const expected = mockRequest.get(
    `/applications/:application/commands/:command`,
    applicationCommandSchema
  );
  const config = generateMock(getGlobalApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(
      getGlobalApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGlobalApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGlobalApplicationCommandQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
