import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  editChannelPermissions,
  editChannelPermissionsProcedure,
  editChannelPermissionsSafe,
  editChannelPermissionsSchema
} from "../editChannelPermissions.js";

describe(`editChannelPermissions`, () => {
  mockRequest.put(`/channels/:channel/permissions/:overwrite`);
  const config = mockSchema(editChannelPermissionsSchema);

  it(`can be used standalone`, async () => {
    await expect(editChannelPermissionsSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editChannelPermissionsProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editChannelPermissions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
