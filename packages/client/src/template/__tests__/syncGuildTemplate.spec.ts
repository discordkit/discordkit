import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  syncGuildTemplate,
  syncGuildTemplateProcedure,
  syncGuildTemplateSafe,
  syncGuildTemplateSchema
} from "../syncGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`syncGuildTemplate`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = mockSchema(syncGuildTemplateSchema);

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
