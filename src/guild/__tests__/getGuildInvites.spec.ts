import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildInvitesProcedure,
  getGuildInvitesQuery,
  getGuildInvitesSafe,
  getGuildInvitesSchema
} from "../getGuildInvites";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata";

describe(`getGuildInvites`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/invites`,
    inviteMetadataSchema.array()
  );
  const config = generateMock(getGuildInvitesSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildInvitesSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildInvitesProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
