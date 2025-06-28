import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  syncGuildTemplate,
  syncGuildTemplateProcedure,
  syncGuildTemplateSafe,
  syncGuildTemplateSchema
} from "../syncGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`syncGuildTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.put(
    `/guilds/:guild/templates/:template`,
    syncGuildTemplateSchema,
    guildTemplateSchema
  );

  it(`can be used standalone`, async () => {
    await expect(syncGuildTemplateSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(syncGuildTemplateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(syncGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
