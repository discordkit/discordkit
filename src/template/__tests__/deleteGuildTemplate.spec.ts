import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuildTemplate,
  deleteGuildTemplateProcedure,
  deleteGuildTemplateSchema
} from "../deleteGuildTemplate";
import { guildTemplateSchema } from "../types/GuildTemplate";

describe(`deleteGuildTemplate`, () => {
  mockRequest.delete(`/guilds/:guild/templates/:template`, guildTemplateSchema);
  const config = generateMock(deleteGuildTemplateSchema);

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
