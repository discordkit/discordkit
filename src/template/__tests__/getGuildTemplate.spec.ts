import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildTemplateProcedure,
  getGuildTemplateQuery,
  getGuildTemplateSchema
} from "../getGuildTemplate";
import { guildTemplateSchema } from "../types/GuildTemplate";

describe(`getGuildTemplate`, () => {
  const expected = mockRequest.get(
    `/guilds/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(getGuildTemplateSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildTemplateProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildTemplateQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
