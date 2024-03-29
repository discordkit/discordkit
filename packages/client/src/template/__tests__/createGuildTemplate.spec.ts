import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildTemplate,
  createGuildTemplateProcedure,
  createGuildTemplateSafe,
  createGuildTemplateSchema
} from "../createGuildTemplate.js";
import { guildTemplateSchema } from "../types/GuildTemplate.js";

describe(`createGuildTemplate`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/templates`,
    guildTemplateSchema
  );
  const config = mockSchema(createGuildTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildTemplateSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildTemplateProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
