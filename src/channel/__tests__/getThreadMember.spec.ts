import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getThreadMemberQuery,
  getThreadMemberSchema
} from "../getThreadMember";
import { threadMemberSchema } from "../types/ThreadMember";

describe(`getThreadMember`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/thread-members/:user`,
    threadMemberSchema
  );
  const config = generateMock(getThreadMemberSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getThreadMember(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getThreadMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
