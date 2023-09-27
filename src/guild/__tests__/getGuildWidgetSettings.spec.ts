import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildWidgetSettingsProcedure,
  getGuildWidgetSettingsQuery,
  getGuildWidgetSettingsSchema
} from "../getGuildWidgetSettings";
import { guildWidgetSettingsSchema } from "../types/GuildWidgetSettings";

describe(`getGuildWidgetSettings`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/widget`,
    guildWidgetSettingsSchema
  );
  const config = generateMock(getGuildWidgetSettingsSchema);

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
