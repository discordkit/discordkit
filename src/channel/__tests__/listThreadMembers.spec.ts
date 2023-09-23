import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listThreadMembersQuery,
  listThreadMembersSchema
} from "../listThreadMembers";
import { threadMemberSchema } from "../types/ThreadMember";

describe(`listThreadMembers`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/thread-members`,
    threadMemberSchema.array()
  );
  const config = generateMock(listThreadMembersSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listThreadMembers(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listThreadMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
