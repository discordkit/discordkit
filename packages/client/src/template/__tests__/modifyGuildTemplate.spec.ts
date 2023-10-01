import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyGuildTemplate,
  modifyGuildTemplateProcedure,
  modifyGuildTemplateSafe,
  modifyGuildTemplateSchema
} from "../modifyGuildTemplate.ts";
import { guildTemplateSchema } from "../types/GuildTemplate.ts";

describe(`modifyGuildTemplate`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(modifyGuildTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildTemplateSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildTemplateProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
