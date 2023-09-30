import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildMemberProcedure,
  getGuildMemberQuery,
  getGuildMemberSafe,
  getGuildMemberSchema
} from "../getGuildMember";
import { memberSchema } from "../types/Member";

describe(`getGuildMember`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(getGuildMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildMemberSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildMemberProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
