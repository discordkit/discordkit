import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildApplicationCommandSchema,
  getGuildApplicationCommandProcedure,
  getGuildApplicationCommandQuery,
  getGuildApplicationCommandSafe
} from "../getGuildApplicationCommand.ts";
import { applicationCommandSchema } from "../types/ApplicationCommand.ts";

describe(`getGuildApplicationCommand`, () => {
  const expected = mockRequest.get(
    `/applications/:application/guilds/:guild/commands/:command`,
    applicationCommandSchema
  );
  const config = mockSchema(getGuildApplicationCommandSchema);

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
