import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyCurrentMember,
  modifyCurrentMemberProcedure,
  modifyCurrentMemberSafe,
  modifyCurrentMemberSchema
} from "../modifyCurrentMember.js";
import { memberSchema } from "../types/Member.js";

describe(`modifyCurrentMember`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/members/@me`,
    modifyCurrentMemberSchema,
    memberSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyCurrentMemberSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyCurrentMemberProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyCurrentMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
