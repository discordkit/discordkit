import { waitFor } from "@testing-library/react";
import { mockRequest, mockQuery } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { userSchema } from "../types";
import { getCurrentUserQuery } from "../getCurrentUser";

describe(`getCurrentUser`, () => {
  const expected = mockRequest.get(`/users/@me`, userSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getCurrentUser();
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getCurrentUserQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
