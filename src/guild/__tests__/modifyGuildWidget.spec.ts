import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildWidget,
  modifyGuildWidgetProcedure,
  modifyGuildWidgetSchema
} from "../modifyGuildWidget";
import { guildWidgetSchema } from "../types/GuildWidget";

describe(`modifyGuildWidget`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/widget`,
    guildWidgetSchema
  );
  const config = generateMock(modifyGuildWidgetSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildWidgetProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildWidget);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
