import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildMFALevel,
  modifyGuildMFALevelSchema
} from "../modifyGuildMFALevel";
import { mfaLevelSchema } from "../types/MFALevel";

describe(`modifyGuildMFALevel`, () => {
  const expected = mockRequest.patch(`/guilds/:guild/mfa`, mfaLevelSchema);
  const config = generateMock(modifyGuildMFALevelSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildMFALevel(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildMFALevel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
