import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  createChannelInvite,
  createChannelInviteSchema
} from "../createChannelInvite";
import { inviteSchema } from "../../invite/types/Invite";

describe(`createChannelInvite`, () => {
  const expected = mockRequest.post(`/channels/:channel/invites`, inviteSchema);
  const config = generateMock(createChannelInviteSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createChannelInvite(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createChannelInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
