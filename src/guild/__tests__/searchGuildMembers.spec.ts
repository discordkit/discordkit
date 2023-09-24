import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  searchGuildMembersProcedure,
  searchGuildMembersQuery,
  searchGuildMembersSchema
} from "../searchGuildMembers";
import { memberSchema } from "../types/Member";

describe(`searchGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members/search`,
    memberSchema.array()
  );
  const config = generateMock(searchGuildMembersSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(searchGuildMembersProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(searchGuildMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
