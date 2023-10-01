import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getGuildPreviewProcedure,
  getGuildPreviewQuery,
  getGuildPreviewSafe,
  getGuildPreviewSchema
} from "../getGuildPreview.ts";
import { guildPreviewSchema } from "../types/GuildPreview.ts";

describe(`getGuildPreview`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/preview`,
    guildPreviewSchema
  );
  const config = generateMock(getGuildPreviewSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildPreviewSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildPreviewProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildPreviewQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});