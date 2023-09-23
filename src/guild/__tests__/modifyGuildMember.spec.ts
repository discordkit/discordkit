import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { memberSchema } from "../types/Member";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildMember,
  modifyGuildMemberSchema
} from "../modifyGuildMember";

describe(`modifyGuildMember`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(modifyGuildMemberSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildMember(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
