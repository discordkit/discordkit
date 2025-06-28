import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildWidgetSettingsProcedure,
  getGuildWidgetSettingsQuery,
  getGuildWidgetSettingsSafe,
  getGuildWidgetSettingsSchema
} from "../getGuildWidgetSettings.js";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings.js";

describe(`getGuildWidgetSettings`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/widget`,
    getGuildWidgetSettingsSchema,
    guildWidgetSettingsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildWidgetSettingsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWidgetSettingsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWidgetSettingsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
