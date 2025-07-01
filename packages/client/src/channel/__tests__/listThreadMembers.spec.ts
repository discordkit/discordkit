import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { threadMemberSchema } from "../types/ThreadMember.js";
import {
  listThreadMembersProcedure,
  listThreadMembersQuery,
  listThreadMembersSafe,
  listThreadMembersSchema
} from "../listThreadMembers.js";

describe(`listThreadMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/thread-members`,
    listThreadMembersSchema,
    v.pipe(v.array(threadMemberSchema), v.length(1))
  );

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
