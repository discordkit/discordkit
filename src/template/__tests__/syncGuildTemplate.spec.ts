import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  syncGuildTemplate,
  syncGuildTemplateProcedure,
  syncGuildTemplateSchema
} from "../syncGuildTemplate";
import { guildTemplateSchema } from "../types/GuildTemplate";

describe(`syncGuildTemplate`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(syncGuildTemplateSchema);

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
