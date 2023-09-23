import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import { mockRequest, mockQuery } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { memberSchema } from "../../guild/types/Member";
import {
  getCurrentUserGuildMemberQuery,
  getCurrentUserGuildMemberSchema
} from "../getCurrentUserGuildMember";

describe(`getCurrentUserGuildMember`, () => {
  const expected = mockRequest.get(
    `/users/@me/guilds/:guild/member`,
    memberSchema
  );
  const config = generateMock(getCurrentUserGuildMemberSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getCurrentUserGuildMember(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getCurrentUserGuildMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
