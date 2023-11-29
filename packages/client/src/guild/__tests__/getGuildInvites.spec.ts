import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length } from "valibot";
import {
  getGuildInvitesProcedure,
  getGuildInvitesQuery,
  getGuildInvitesSafe,
  getGuildInvitesSchema
} from "../getGuildInvites.js";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";

describe(`getGuildInvites`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/invites`,
    array(inviteMetadataSchema, [length(1)])
  );
  const config = mockSchema(getGuildInvitesSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildInvitesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildInvitesProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
