import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { inviteSchema } from "../../invite/types/Invite";
import { client } from "../__fixtures__/router";
import {
  getChannelInvitesQuery,
  getChannelInvitesSchema
} from "../getChannelInvites";

describe(`getChannelInvites`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/invites`,
    inviteSchema.array()
  );
  const config = generateMock(getChannelInvitesSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getChannelInvites(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getChannelInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
