import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  modifyGuildTemplate,
  modifyGuildTemplateProcedure,
  modifyGuildTemplateSafe,
  modifyGuildTemplateSchema
} from "../modifyGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`modifyGuildTemplate`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = mockSchema(modifyGuildTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildTemplateSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildTemplateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
