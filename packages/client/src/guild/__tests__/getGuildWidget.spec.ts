import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getGuildWidgetProcedure,
  getGuildWidgetQuery,
  getGuildWidgetSafe,
  getGuildWidgetSchema
} from "../getGuildWidget.ts";
import { guildWidgetSchema } from "../types/GuildWidget.ts";

describe(`getGuildWidget`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/widget.json`,
    guildWidgetSchema
  );
  const config = generateMock(getGuildWidgetSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildWidgetSafe(config)).resolves.toStrictEqual(expected);
  });

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
