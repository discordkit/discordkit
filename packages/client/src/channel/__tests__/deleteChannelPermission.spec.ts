import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteChannelPermission,
  deleteChannelPermissionProcedure,
  deleteChannelPermissionSafe,
  deleteChannelPermissionSchema
} from "../deleteChannelPermission.js";

describe(`deleteChannelPermission`, () => {
  mockRequest.delete(`/channels/:channel/permissions/:overwrite`);
  const config = mockSchema(deleteChannelPermissionSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteChannelPermissionSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteChannelPermissionProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteChannelPermission);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
