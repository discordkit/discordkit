import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildWidget,
  modifyGuildWidgetProcedure,
  modifyGuildWidgetSafe,
  modifyGuildWidgetSchema
} from "../modifyGuildWidget.js";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings.js";

describe(`modifyGuildWidget`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/widget`,
    modifyGuildWidgetSchema,
    guildWidgetSettingsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildWidgetSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildWidgetProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildWidget);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
