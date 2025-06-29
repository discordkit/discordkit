import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getThreadMemberProcedure,
  getThreadMemberQuery,
  getThreadMemberSafe,
  getThreadMemberSchema
} from "../getThreadMember.js";
import { threadMemberSchema } from "../types/ThreadMember.js";

describe(`getThreadMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/thread-members/:user`,
    getThreadMemberSchema,
    threadMemberSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getThreadMemberSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getThreadMemberProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getThreadMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
