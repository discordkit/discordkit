import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildApplicationCommandProcedure,
  createGuildApplicationCommand,
  createGuildApplicationCommandSchema,
  createGuildApplicationCommandSafe
} from "../createGuildApplicationCommand.js";
import { applicationCommandSchema } from "../types/ApplicationCommand.js";

describe(`createGuildApplicationCommand`, () => {
  const expected = mockRequest.post(
    `/applications/:application/guilds/:guild/commands`,
    applicationCommandSchema
  );
  const config = mockSchema(createGuildApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildApplicationCommandSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildApplicationCommandProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
