import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildFromTemplate,
  createGuildFromTemplateProcedure,
  createGuildFromTemplateSafe,
  createGuildFromTemplateSchema
} from "../createGuildFromTemplate.js";
import { guildSchema } from "../../guild/types/Guild.js";

describe(`createGuildFromTemplate`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/templates/:template`,
    createGuildFromTemplateSchema,
    guildSchema
  );

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
