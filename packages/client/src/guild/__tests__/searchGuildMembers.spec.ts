import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  searchGuildMembersProcedure,
  searchGuildMembersQuery,
  searchGuildMembersSafe,
  searchGuildMembersSchema
} from "../searchGuildMembers.js";
import { memberSchema } from "../types/Member.js";

describe(`searchGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members/search`,
    pipe(array(memberSchema), length(1))
  );
  const config = mockSchema(searchGuildMembersSchema);

  it(`can be used standalone`, async () => {
    await expect(searchGuildMembersSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(searchGuildMembersProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(searchGuildMembersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
