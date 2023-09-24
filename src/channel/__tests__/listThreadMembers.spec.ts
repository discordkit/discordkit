import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listThreadMembersProcedure,
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
    await expect(
      runProcedure(listThreadMembersProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listThreadMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
