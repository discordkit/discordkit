import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  listGuildMembersProcedure,
  listGuildMembersQuery,
  listGuildMembersSafe,
  listGuildMembersSchema
} from "../listGuildMembers.js";
import { memberSchema } from "../types/Member.js";

describe(`listGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members`,
    memberSchema.array().length(1)
  );
  const config = mockSchema(listGuildMembersSchema);

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
