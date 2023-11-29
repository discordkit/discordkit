import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  addGuildMember,
  addGuildMemberProcedure,
  addGuildMemberSafe,
  addGuildMemberSchema
} from "../addGuildMember.js";
import { memberSchema } from "../types/Member.js";

describe(`addGuildMember`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = mockSchema(addGuildMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(addGuildMemberSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(addGuildMemberProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(addGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
