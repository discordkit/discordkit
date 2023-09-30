import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuildFromTemplate,
  createGuildFromTemplateProcedure,
  createGuildFromTemplateSafe,
  createGuildFromTemplateSchema
} from "../createGuildFromTemplate";
import { guildSchema } from "../../guild/types/Guild";

describe(`createGuildFromTemplate`, () => {
  const expected = mockRequest.post(`/guilds/templates/:template`, guildSchema);
  const config = generateMock(createGuildFromTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildFromTemplateSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildFromTemplateProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildFromTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
