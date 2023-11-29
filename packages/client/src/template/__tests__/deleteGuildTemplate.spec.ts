import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteGuildTemplate,
  deleteGuildTemplateProcedure,
  deleteGuildTemplateSafe,
  deleteGuildTemplateSchema
} from "../deleteGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`deleteGuildTemplate`, () => {
  const expected = mockRequest.delete(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = mockSchema(deleteGuildTemplateSchema);

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
