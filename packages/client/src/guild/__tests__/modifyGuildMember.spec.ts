import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  modifyGuildMember,
  modifyGuildMemberProcedure,
  modifyGuildMemberSafe,
  modifyGuildMemberSchema
} from "../modifyGuildMember.js";
import { memberSchema } from "../types/Member.js";

describe(`modifyGuildMember`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = mockSchema(modifyGuildMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildMemberSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildMemberProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
