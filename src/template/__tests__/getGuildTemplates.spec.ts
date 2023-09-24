import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildTemplatesProcedure,
  getGuildTemplatesQuery,
  getGuildTemplatesSchema
} from "../getGuildTemplates";
import { guildTemplateSchema } from "../types/GuildTemplate";

describe(`getGuildTemplates`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/templates`,
    guildTemplateSchema.array()
  );
  const config = generateMock(getGuildTemplatesSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildTemplatesProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildTemplatesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
