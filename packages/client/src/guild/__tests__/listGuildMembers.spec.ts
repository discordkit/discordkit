import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { memberSchema } from "../types/Member.js";
import {
  listGuildMembersProcedure,
  listGuildMembersQuery,
  listGuildMembersSafe,
  listGuildMembersSchema
} from "../listGuildMembers.js";

describe(`listGuildMembers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/members`,
    listGuildMembersSchema,
    v.pipe(v.array(memberSchema), v.length(1))
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
