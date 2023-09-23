import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildTemplateSchema } from "../types";
import {
  getGuildTemplatesQuery,
  getGuildTemplatesSchema
} from "../getGuildTemplates";

describe(`getGuildTemplates`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/templates`,
    guildTemplateSchema.array()
  );
  const config = generateMock(getGuildTemplatesSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildTemplates(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildTemplatesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
