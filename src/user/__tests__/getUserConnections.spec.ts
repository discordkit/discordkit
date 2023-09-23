import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getUserConnectionsQuery } from "../getUserConnections";
import { connectionSchema } from "../types";

describe(`getUserConnections`, () => {
  const expected = mockRequest.get(`/users/@me/connections`, connectionSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getUserConnections();
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getUserConnectionsQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
