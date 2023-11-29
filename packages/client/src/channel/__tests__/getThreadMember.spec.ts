import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getThreadMemberProcedure,
  getThreadMemberQuery,
  getThreadMemberSafe,
  getThreadMemberSchema
} from "../getThreadMember.js";
import { threadMemberSchema } from "../types/ThreadMember.js";

describe(`getThreadMember`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/thread-members/:user`,
    threadMemberSchema
  );
  const config = mockSchema(getThreadMemberSchema);

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
