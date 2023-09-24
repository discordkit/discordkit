import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  addGuildMember,
  addGuildMemberProcedure,
  addGuildMemberSchema
} from "../addGuildMember";
import { memberSchema } from "../types/Member";

describe(`addGuildMember`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(addGuildMemberSchema);

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
