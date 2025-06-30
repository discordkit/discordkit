import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteGuildTemplate,
  deleteGuildTemplateProcedure,
  deleteGuildTemplateSafe,
  deleteGuildTemplateSchema
} from "../deleteGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`deleteGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.delete(
    `/guilds/:guild/templates/:template`,
    deleteGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteGuildTemplateSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildTemplateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
