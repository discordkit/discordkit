import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listGuildMembersProcedure,
  listGuildMembersQuery,
  listGuildMembersSafe,
  listGuildMembersSchema
} from "../listGuildMembers.js";
import { memberSchema } from "../types/Member.js";

describe(`listGuildMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/members`,
    listGuildMembersSchema,
    pipe(array(memberSchema), length(1))
  );

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
