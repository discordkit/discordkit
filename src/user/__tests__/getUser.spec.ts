import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { userSchema } from "../types";
import { getUserQuery, getUserSchema } from "../getUser";

describe(`getUser`, () => {
  const expected = mockRequest.get(`/users/:user`, userSchema);
  const config = generateMock(getUserSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getUser(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getUserQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
