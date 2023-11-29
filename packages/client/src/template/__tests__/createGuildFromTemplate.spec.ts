import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  createGuildFromTemplate,
  createGuildFromTemplateProcedure,
  createGuildFromTemplateSafe,
  createGuildFromTemplateSchema
} from "../createGuildFromTemplate.js";
import { guildSchema } from "../../guild/types/Guild.js";

describe(`createGuildFromTemplate`, () => {
  const expected = mockRequest.post(`/guilds/templates/:template`, guildSchema);
  const config = mockSchema(createGuildFromTemplateSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildFromTemplateSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildFromTemplateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildFromTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
