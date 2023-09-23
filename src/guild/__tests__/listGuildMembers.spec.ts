import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  listGuildMembersQuery,
  listGuildMembersSchema
} from "../listGuildMembers";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { memberSchema } from "../types/Member";

describe(`listGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members`,
    memberSchema.array()
  );
  const config = generateMock(listGuildMembersSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listGuildMembers(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listGuildMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
