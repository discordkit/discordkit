import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getCurrentUserGuildMemberProcedure,
  getCurrentUserGuildMemberQuery,
  getCurrentUserGuildMemberSafe,
  getCurrentUserGuildMemberSchema
} from "../getCurrentUserGuildMember.js";
import { memberSchema } from "../../guild/types/Member.js";

describe(`getCurrentUserGuildMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/guilds/:guild/member`,
    getCurrentUserGuildMemberSchema,
    memberSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserGuildMemberSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserGuildMemberProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserGuildMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
