import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  listThreadMembersProcedure,
  listThreadMembersQuery,
  listThreadMembersSafe,
  listThreadMembersSchema
} from "../listThreadMembers.ts";
import { threadMemberSchema } from "../types/ThreadMember.ts";

describe(`listThreadMembers`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/thread-members`,
    threadMemberSchema.array().length(1)
  );
  const config = mockSchema(listThreadMembersSchema);

  it(`can be used standalone`, async () => {
    await expect(listThreadMembersSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

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
