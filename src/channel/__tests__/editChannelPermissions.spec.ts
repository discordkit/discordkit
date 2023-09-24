import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editChannelPermissions,
  editChannelPermissionsProcedure,
  editChannelPermissionsSchema
} from "../editChannelPermissions";

describe(`editChannelPermissions`, () => {
  mockRequest.put(`/channels/:channel/permissions/:overwrite`);
  const config = generateMock(editChannelPermissionsSchema);

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
