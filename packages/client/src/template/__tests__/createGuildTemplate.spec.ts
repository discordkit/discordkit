import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createGuildTemplate,
  createGuildTemplateProcedure,
  createGuildTemplateSafe,
  createGuildTemplateSchema
} from "../createGuildTemplate.ts";
import { guildTemplateSchema } from "../types/GuildTemplate.ts";

describe(`createGuildTemplate`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/templates`,
    guildTemplateSchema
  );
  const config = generateMock(createGuildTemplateSchema);

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
