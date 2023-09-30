import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildApplicationCommandSchema,
  getGuildApplicationCommandProcedure,
  getGuildApplicationCommandQuery,
  getGuildApplicationCommandSafe
} from "../getGuildApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`getGuildApplicationCommand`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands/:command`,
    applicationCommandSchema
  );
  const config = generateMock(getGuildApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildApplicationCommandSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildApplicationCommandQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
