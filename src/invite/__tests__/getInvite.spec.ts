import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { inviteSchema } from "../types";
import { getInviteQuery, getInviteSchema } from "../getInvite";

describe(`getInvite`, () => {
  mockRequest.get(`/invites/:code`, inviteSchema);
  const config = generateMock(getInviteSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getInvite(config);
    expect(actual).toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getInviteQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
