import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteChannelPermission,
  deleteChannelPermissionProcedure,
  deleteChannelPermissionSafe,
  deleteChannelPermissionSchema
} from "../deleteChannelPermission";

describe(`deleteChannelPermission`, () => {
  mockRequest.delete(`/channels/:channel/permissions/:overwrite`);
  const config = generateMock(deleteChannelPermissionSchema);

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
