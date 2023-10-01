import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  searchGuildMembersProcedure,
  searchGuildMembersQuery,
  searchGuildMembersSafe,
  searchGuildMembersSchema
} from "../searchGuildMembers.ts";
import { memberSchema } from "../types/Member.ts";

describe(`searchGuildMembers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members/search`,
    memberSchema.array().length(1)
  );
  const config = mockSchema(searchGuildMembersSchema);

  it(`can be used standalone`, async () => {
    await expect(searchGuildMembersSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

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
