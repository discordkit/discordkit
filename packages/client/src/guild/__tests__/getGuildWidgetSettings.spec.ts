import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildWidgetSettingsProcedure,
  getGuildWidgetSettingsQuery,
  getGuildWidgetSettingsSafe,
  getGuildWidgetSettingsSchema
} from "../getGuildWidgetSettings.js";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings.js";

describe(`getGuildWidgetSettings`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/widget`,
    guildWidgetSettingsSchema
  );
  const config = mockSchema(getGuildWidgetSettingsSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildWidgetSettingsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWidgetSettingsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWidgetSettingsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
