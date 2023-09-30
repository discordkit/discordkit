import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getThreadMemberProcedure,
  getThreadMemberQuery,
  getThreadMemberSafe,
  getThreadMemberSchema
} from "../getThreadMember";
import { threadMemberSchema } from "../types/ThreadMember";

describe(`getThreadMember`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/thread-members/:user`,
    threadMemberSchema
  );
  const config = generateMock(getThreadMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(getThreadMemberSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getThreadMemberProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getThreadMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
