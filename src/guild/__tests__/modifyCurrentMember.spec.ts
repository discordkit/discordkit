import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyCurrentMember,
  modifyCurrentMemberProcedure,
  modifyCurrentMemberSafe,
  modifyCurrentMemberSchema
} from "../modifyCurrentMember";
import { memberSchema } from "../types/Member";

describe(`modifyCurrentMember`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/members/@me`,
    memberSchema
  );
  const config = generateMock(modifyCurrentMemberSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyCurrentMemberSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyCurrentMemberProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyCurrentMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
