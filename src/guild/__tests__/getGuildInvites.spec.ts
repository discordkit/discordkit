import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { inviteSchema } from "../../invite/types/Invite";
import { client } from "../__fixtures__/router";
import {
  getGuildInvitesQuery,
  getGuildInvitesSchema
} from "../getGuildInvites";

describe(`getGuildInvites`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/invites`,
    inviteSchema.array()
  );
  const config = generateMock(getGuildInvitesSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildInvites(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
