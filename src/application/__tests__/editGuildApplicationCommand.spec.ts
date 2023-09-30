import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editGuildApplicationCommand,
  editGuildApplicationCommandProcedure,
  editGuildApplicationCommandSafe,
  editGuildApplicationCommandSchema
} from "../editGuildApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`editGuildApplicationCommand`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/guilds/:guild/commands/:command`,
    applicationCommandSchema
  );
  const config = generateMock(editGuildApplicationCommandSchema);

  it(`can be used standalone`, async () => {
    await expect(
      editGuildApplicationCommandSafe(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editGuildApplicationCommandProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editGuildApplicationCommand);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
