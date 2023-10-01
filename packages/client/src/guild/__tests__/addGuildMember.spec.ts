import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  addGuildMember,
  addGuildMemberProcedure,
  addGuildMemberSafe,
  addGuildMemberSchema
} from "../addGuildMember.ts";
import { memberSchema } from "../types/Member.ts";

describe(`addGuildMember`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(addGuildMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(addGuildMemberSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(addGuildMemberProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(addGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
