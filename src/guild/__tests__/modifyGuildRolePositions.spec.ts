import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildRolePositions,
  modifyGuildRolePositionsSchema
} from "../modifyGuildRolePositions";
import { roleSchema } from "../types/Role";

describe(`modifyGuildRolePositions`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/roles`,
    roleSchema.array()
  );
  const config = generateMock(modifyGuildRolePositionsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildRolePositions(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildRolePositions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
