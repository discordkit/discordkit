import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildWidget,
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
    const actual = await client.modifyGuildWidget(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildWidget);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
