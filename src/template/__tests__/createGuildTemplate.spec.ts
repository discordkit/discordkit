import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildTemplateSchema } from "../types";
import {
  createGuildTemplate,
  createGuildTemplateSchema
} from "../createGuildTemplate";

describe(`createGuildTemplate`, () => {
  const expected = mockRequest.post(
    `/guilds/:guild/templates`,
    guildTemplateSchema
  );
  const config = generateMock(createGuildTemplateSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildTemplate(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
