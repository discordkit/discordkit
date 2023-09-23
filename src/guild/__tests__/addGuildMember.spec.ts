import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { addGuildMember, addGuildMemberSchema } from "../addGuildMember";
import { memberSchema } from "../types/Member";

describe(`addGuildMember`, () => {
  const expected = mockRequest.put(
    `/guilds/:guild/members/:user`,
    memberSchema
  );
  const config = generateMock(addGuildMemberSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.addGuildMember(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(addGuildMember);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
