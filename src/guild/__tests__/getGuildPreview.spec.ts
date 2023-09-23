import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildPreviewQuery,
  getGuildPreviewSchema
} from "../getGuildPreview";
import { guildSchema } from "../types/Guild";

describe(`getGuildPreview`, () => {
  const expected = mockRequest.get(`/guilds/:guild/preview`, guildSchema);
  const config = generateMock(getGuildPreviewSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildPreview(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildPreviewQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
