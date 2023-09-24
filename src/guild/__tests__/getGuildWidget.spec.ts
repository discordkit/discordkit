import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildWidgetProcedure,
  getGuildWidgetQuery,
  getGuildWidgetSchema
} from "../getGuildWidget";
import { guildWidgetSchema } from "../types/GuildWidget";

describe(`getGuildWidget`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/widget.json`,
    guildWidgetSchema
  );
  const config = generateMock(getGuildWidgetSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWidgetProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWidgetQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
