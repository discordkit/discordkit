import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { guildSchema } from "../../guild";
import {
  getCurrentUserGuildsQuery,
  getCurrentUserGuildsSchema
} from "../getCurrentUserGuilds";

describe(`getCurrentUserGuilds`, () => {
  const expected = mockRequest.get(`/users/@me/guilds`, guildSchema.array());
  const config = generateMock(getCurrentUserGuildsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getCurrentUserGuilds(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getCurrentUserGuildsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
