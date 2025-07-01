import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { guildTemplateSchema } from "../types/GuildTemplate.js";
import {
  getGuildTemplatesProcedure,
  getGuildTemplatesQuery,
  getGuildTemplatesSafe,
  getGuildTemplatesSchema
} from "../getGuildTemplates.js";

describe(`getGuildTemplates`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/templates`,
    getGuildTemplatesSchema,
    v.pipe(v.array(guildTemplateSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildTemplatesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildTemplatesProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildTemplatesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
