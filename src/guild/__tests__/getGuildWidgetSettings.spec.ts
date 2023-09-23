import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildWidgetSettingsQuery,
  getGuildWidgetSettingsSchema
} from "../getGuildWidgetSettings";
import { guildWidgetSchema } from "../types/GuildWidget";

describe(`getGuildWidgetSettings`, () => {
  const expected = mockRequest.get(`/guilds/:guild/widget`, guildWidgetSchema);
  const config = generateMock(getGuildWidgetSettingsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildWidgetSettings(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildWidgetSettingsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
