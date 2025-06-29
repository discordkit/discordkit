import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildTemplateProcedure,
  getGuildTemplateQuery,
  getGuildTemplateSafe,
  getGuildTemplateSchema
} from "../getGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`getGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/templates/:template`,
    getGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildTemplateSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildTemplateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildTemplateQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
