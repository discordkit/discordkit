import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getGuildTemplatesProcedure,
  getGuildTemplatesQuery,
  getGuildTemplatesSafe,
  getGuildTemplatesSchema
} from "../getGuildTemplates.ts";
import { guildTemplateSchema } from "../types/GuildTemplate.ts";

describe(`getGuildTemplates`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/templates`,
    guildTemplateSchema.array().length(1)
  );
  const config = generateMock(getGuildTemplatesSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildTemplatesSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

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
