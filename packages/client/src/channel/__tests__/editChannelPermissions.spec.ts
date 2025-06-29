import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  editChannelPermissions,
  editChannelPermissionsProcedure,
  editChannelPermissionsSafe,
  editChannelPermissionsSchema
} from "../editChannelPermissions.js";

describe(`editChannelPermissions`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/permissions/:overwrite`,
    editChannelPermissionsSchema
  );

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
