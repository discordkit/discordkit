import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildVanityURLQuery,
  getGuildVanityURLSchema
} from "../getGuildVanityURL";
import { inviteSchema } from "../../invite/types/Invite";

describe(`getGuildVanityURL`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/vanity-url`,
    inviteSchema.partial()
  );
  const config = generateMock(getGuildVanityURLSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildVanityURL(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildVanityURLQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
