import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteChannelPermission,
  deleteChannelPermissionSchema
} from "../deleteChannelPermission";

describe(`deleteChannelPermission`, () => {
  mockRequest.delete(`/channels/:channel/permissions/:overwrite`);
  const config = generateMock(deleteChannelPermissionSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteChannelPermission(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteChannelPermission);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
