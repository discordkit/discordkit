import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildTemplate,
  createGuildTemplateProcedure,
  createGuildTemplateSafe,
  createGuildTemplateSchema
} from "../createGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`createGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/templates`,
    createGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildTemplateSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildTemplateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
