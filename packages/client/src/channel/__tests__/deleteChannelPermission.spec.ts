import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteChannelPermission,
  deleteChannelPermissionProcedure,
  deleteChannelPermissionSafe,
  deleteChannelPermissionSchema
} from "../deleteChannelPermission.js";

describe(`deleteChannelPermission`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/permissions/:overwrite`,
    deleteChannelPermissionSchema
  );

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
