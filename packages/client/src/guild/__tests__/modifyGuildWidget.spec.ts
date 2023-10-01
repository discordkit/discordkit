import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyGuildWidget,
  modifyGuildWidgetProcedure,
  modifyGuildWidgetSafe,
  modifyGuildWidgetSchema
} from "../modifyGuildWidget.ts";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings.ts";

describe(`modifyGuildWidget`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/widget`,
    guildWidgetSettingsSchema
  );
  const config = generateMock(modifyGuildWidgetSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildWidgetSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

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
