import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildMemberProcedure,
  getGuildMemberQuery,
  getGuildMemberSafe,
  getGuildMemberSchema
} from "../getGuildMember.js";
import { memberSchema } from "../types/Member.js";

describe(`getGuildMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/members/:user`,
    getGuildMemberSchema,
    memberSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildMemberSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildMemberProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
