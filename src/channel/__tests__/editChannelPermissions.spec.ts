import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  editChannelPermissions,
  editChannelPermissionsSchema
} from "../editChannelPermissions";

describe(`editChannelPermissions`, () => {
  mockRequest.put(`/channels/:channel/permissions/:overwrite`);
  const config = generateMock(editChannelPermissionsSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.editChannelPermissions(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(editChannelPermissions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
