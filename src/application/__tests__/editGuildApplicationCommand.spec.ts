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
  editGuildApplicationCommandSchema
} from "../editGuildApplicationCommand";
import { applicationCommandSchema } from "../types/ApplicationCommand";

describe(`editGuildApplicationCommand`, () => {
  const expected = mockRequest.patch(
    `/applications/:application/guilds/:guild/commands/:command`,
    applicationCommandSchema
  );
  const input = generateMock(editGuildApplicationCommandSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editGuildApplicationCommandProcedure)(input)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editGuildApplicationCommand);
    result.current.mutate(input);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
