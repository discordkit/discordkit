import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  syncGuildTemplate,
  syncGuildTemplateProcedure,
  syncGuildTemplateSafe,
  syncGuildTemplateSchema
} from "../syncGuildTemplate.ts";
import { guildTemplateSchema } from "../types/GuildTemplate.ts";

describe(`syncGuildTemplate`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(syncGuildTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(syncGuildTemplateSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(syncGuildTemplateProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(syncGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
