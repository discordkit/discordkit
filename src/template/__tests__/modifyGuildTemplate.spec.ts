import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildTemplate,
  modifyGuildTemplateProcedure,
  modifyGuildTemplateSchema
} from "../modifyGuildTemplate";
import { guildTemplateSchema } from "../types/GuildTemplate";

describe(`modifyGuildTemplate`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(modifyGuildTemplateSchema);

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
