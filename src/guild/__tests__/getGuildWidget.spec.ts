import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildWidgetQuery, getGuildWidgetSchema } from "../getGuildWidget";
import { guildWidgetSchema } from "../types/GuildWidget";

describe(`getGuildWidget`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/widget.json`,
    guildWidgetSchema
  );
  const config = generateMock(getGuildWidgetSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildWidget(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildWidgetQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
