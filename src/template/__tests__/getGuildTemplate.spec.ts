import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildTemplateSchema } from "../types";
import {
  getGuildTemplateQuery,
  getGuildTemplateSchema
} from "../getGuildTemplate";

describe(`getGuildTemplate`, () => {
  const expected = mockRequest.get(
    `/guilds/templates/:template`,
    guildTemplateSchema
  );
  const config = generateMock(getGuildTemplateSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildTemplate(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildTemplateQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
