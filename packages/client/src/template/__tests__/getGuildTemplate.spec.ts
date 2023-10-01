import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildTemplateProcedure,
  getGuildTemplateQuery,
  getGuildTemplateSafe,
  getGuildTemplateSchema
} from "../getGuildTemplate.ts";
import { guildTemplateSchema } from "../types/GuildTemplate.ts";

describe(`getGuildTemplate`, () => {
  const expected = mockRequest.get(
    `/guilds/templates/:template`,
    guildTemplateSchema
  );
  const config = mockSchema(getGuildTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildTemplateSafe(config)).resolves.toStrictEqual(expected);
  });

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
