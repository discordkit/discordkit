import { waitFor } from "@testing-library/react";
import { generateMock } from "@anatine/zod-mock";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getCurrentUserGuildMemberProcedure,
  getCurrentUserGuildMemberQuery,
  getCurrentUserGuildMemberSafe,
  getCurrentUserGuildMemberSchema
} from "../getCurrentUserGuildMember";
import { memberSchema } from "../../guild/types/Member";

describe(`getCurrentUserGuildMember`, () => {
  const expected = mockRequest.get(
    `/users/@me/guilds/:guild/member`,
    memberSchema
  );
  const config = generateMock(getCurrentUserGuildMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserGuildMemberSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserGuildMemberProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserGuildMemberQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
