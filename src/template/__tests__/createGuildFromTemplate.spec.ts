import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildSchema } from "../../guild";
import {
  createGuildFromTemplate,
  createGuildFromTemplateSchema
} from "../createGuildFromTemplate";

describe(`createGuildFromTemplate`, () => {
  const expected = mockRequest.post(`/guilds/templates/:template`, guildSchema);
  const config = generateMock(createGuildFromTemplateSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildFromTemplate(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildFromTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
