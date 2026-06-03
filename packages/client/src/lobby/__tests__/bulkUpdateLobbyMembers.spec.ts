import * as v from "valibot";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  bulkUpdateLobbyMembers,
  bulkUpdateLobbyMembersSchema
} from "../bulkUpdateLobbyMembers.js";
import { lobbyMemberSchema } from "../types/LobbyMember.js";

describe(`bulkUpdateLobbyMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/lobbies/:lobby/members/bulk`,
    bulkUpdateLobbyMembersSchema,
    v.array(lobbyMemberSchema)
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        bulkUpdateLobbyMembers,
        bulkUpdateLobbyMembersSchema,
        v.array(lobbyMemberSchema)
      )(config)
    ).resolves.toEqual(expected);
  });
});
