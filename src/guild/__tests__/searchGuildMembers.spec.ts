import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  searchGuildMembersQuery,
  searchGuildMembersSchema
} from "../searchGuildMembers";
import { memberSchema } from "../types/Member";

describe(`searchGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members/search`,
    memberSchema.array()
  );
  const config = generateMock(searchGuildMembersSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.searchGuildMembers(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(searchGuildMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
