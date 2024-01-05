import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length } from "valibot";
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
    array(memberSchema, [length(1)])
  );
  const config = mockSchema(listGuildMembersSchema);

  it(`can be used standalone`, async () => {
    await expect(listGuildMembersSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildMembersProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
