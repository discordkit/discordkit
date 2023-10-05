import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildTemplatesProcedure,
  getGuildTemplatesQuery,
  getGuildTemplatesSafe,
  getGuildTemplatesSchema
} from "../getGuildTemplates.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`getGuildTemplates`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/templates`,
    guildTemplateSchema.array().length(1)
  );
  const config = mockSchema(getGuildTemplatesSchema);

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
