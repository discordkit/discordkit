import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  removeGuildMember,
  removeGuildMemberProcedure,
  removeGuildMemberSchema
} from "../removeGuildMember";

describe(`removeGuildMember`, () => {
  mockRequest.delete(`/guilds/:guild/members/:user`);
  const config = generateMock(removeGuildMemberSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(removeGuildMemberProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(removeGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
