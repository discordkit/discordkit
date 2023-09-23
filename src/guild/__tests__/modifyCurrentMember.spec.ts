import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyCurrentMember,
  modifyCurrentMemberSchema
} from "../modifyCurrentMember";
import { memberSchema } from "../types/Member";

describe(`modifyCurrentMember`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/members/@me`,
    memberSchema
  );
  const config = generateMock(modifyCurrentMemberSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyCurrentMember(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyCurrentMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
