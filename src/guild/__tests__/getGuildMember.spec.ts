import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildMemberQuery, getGuildMemberSchema } from "../getGuildMember";
import { memberSchema } from "../types/Member";

describe(`getGuildMember`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(getGuildMemberSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildMember(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
