import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildMember,
  modifyGuildMemberProcedure,
  modifyGuildMemberSchema
} from "../modifyGuildMember";
import { memberSchema } from "../types/Member";

describe(`modifyGuildMember`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(modifyGuildMemberSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildMemberProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
