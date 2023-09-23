import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildTemplateSchema } from "../types";
import {
  modifyGuildTemplate,
  modifyGuildTemplateSchema
} from "../modifyGuildTemplate";

describe(`modifyGuildTemplate`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(modifyGuildTemplateSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildTemplate(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildTemplate);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
