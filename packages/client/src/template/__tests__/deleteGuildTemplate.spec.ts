import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteGuildTemplate,
  deleteGuildTemplateProcedure,
  deleteGuildTemplateSafe,
  deleteGuildTemplateSchema
} from "../deleteGuildTemplate.ts";
import { guildTemplateSchema } from "../types/GuildTemplate.ts";

describe(`deleteGuildTemplate`, () => {
  mockRequest.delete(`/guilds/:guild/templates/:template`, guildTemplateSchema);
  const config = generateMock(deleteGuildTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteGuildTemplateSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildTemplateProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result).toBeDefined();
  });
});
