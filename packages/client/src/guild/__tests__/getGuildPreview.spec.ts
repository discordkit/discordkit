import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import {
  getGuildPreviewProcedure,
  getGuildPreviewQuery,
  getGuildPreviewSafe,
  getGuildPreviewSchema
} from "../getGuildPreview.js";
import { guildPreviewSchema } from "../types/GuildPreview.js";

describe(`getGuildPreview`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/preview`,
    guildPreviewSchema
  );
  const config = mockSchema(getGuildPreviewSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildPreviewSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildPreviewProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildPreviewQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
