import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  listThreadMembersProcedure,
  listThreadMembersQuery,
  listThreadMembersSafe,
  listThreadMembersSchema
} from "../listThreadMembers.js";
import { threadMemberSchema } from "../types/ThreadMember.js";

describe(`listThreadMembers`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/thread-members`,
    array(threadMemberSchema, [length(1)])
  );
  const config = mockSchema(listThreadMembersSchema);

  it(`can be used standalone`, async () => {
    await expect(listThreadMembersSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listThreadMembersProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listThreadMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
