import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length, pipe } from "valibot";
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
    pipe(array(guildTemplateSchema), length(1))
  );
  const config = mockSchema(getGuildTemplatesSchema);

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
