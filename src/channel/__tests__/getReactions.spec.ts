import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getReactionsQuery, getReactionsSchema } from "../getReactions";
import { userSchema } from "../../user/types/User";

describe(`getReactions`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    userSchema.partial().array()
  );
  const config = generateMock(getReactionsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getReactions(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getReactionsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
