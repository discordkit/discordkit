import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  listGuildMembersProcedure,
  listGuildMembersQuery,
  listGuildMembersSafe,
  listGuildMembersSchema
} from "../listGuildMembers";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import { memberSchema } from "../types/Member";

describe(`listGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members`,
    memberSchema.array()
  );
  const config = generateMock(listGuildMembersSchema);

  it(`can be used standalone`, async () => {
    await expect(listGuildMembersSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildMembersProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
