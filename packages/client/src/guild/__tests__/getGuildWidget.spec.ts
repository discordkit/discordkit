import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildWidgetProcedure,
  getGuildWidgetQuery,
  getGuildWidgetSafe,
  getGuildWidgetSchema
} from "../getGuildWidget.js";
import { guildWidgetSchema } from "../types/GuildWidget.js";

describe(`getGuildWidget`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/widget.json`,
    guildWidgetSchema
  );
  const config = mockSchema(getGuildWidgetSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildWidgetSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildWidgetProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildWidgetQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
